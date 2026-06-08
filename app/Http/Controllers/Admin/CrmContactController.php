<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Services\CrmContactImportSampleGenerator;
use App\Support\CompanyContext;
use App\Support\Filters\WildcardPattern;
use App\Support\ImportContactRowNormalizer;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Inertia\Response;
use Carbon\Carbon;
use File;
use libphonenumber\PhoneNumberUtil;

//Concerns:
use App\Concerns\HasBusinessTypes;
use App\Concerns\HasContactTypes;
use App\Concerns\HasSalutation;

//Models:
use App\Models\Category;
use App\Models\Company;
use App\Models\CostCenter;
use App\Models\Country;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\CustomerProvider;
use App\Models\MarketingList;
use App\Models\Phone;
use App\Models\Province;
use App\Models\Town;
use App\Models\User;
use App\Models\UserColumnPreference;
use App\Models\UserCompany;

//Requests:
use App\Http\Requests\UserFilterRequest;

//Resources:
use App\Http\Resources\UserResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class CrmContactController extends Controller{
    /**
     * 1. Listado de contactos.
     * 1.1. Contactos para exportación.
     * 1.2. Data Query contactos.
     * 1.3. Definición de filtros avanzados.
     * 1.4. Configuración de filtros avanzados.
     * 1.5. Leyenda de filtros aplicados.
     * 2. Nuevos contactos.
     * 3. Eliminar un contacto CRM.
     * 4. Formulario importación de contactos.
     * 5. Template .xls para importación de contactos.
     * 6. Importar contactos.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'crm';
    private $option = 'contactos_crm';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'crm-contacts.create',
                'crm-contacts.destroy',
                'crm-contacts.edit',
                'crm-contacts.index',
                'crm-contacts.search',
                'crm-contacts.show',
                'crm-contacts.update',
                'marketing-lists.create'
            ]);   
        } 
    }   

    /**
     * 1. Listado de contactos.
     */
    public function index(Request $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        
        $leads = $request->segment(2) === 'crm-leads';

        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        // que dataQuery pueda leerlo desde $request->input('leads')
        $request->merge(['leads' => $leads]);

        $contacts = $this->dataQuery($request)
            ->paginate($perPage)
            ->onEachSide(1);

        $salutations          = HasSalutation::comboOptions();
        $contact_types        = HasContactTypes::typesMap();
        $contact_types_combo  = HasContactTypes::comboOptions();

        //Subtipos de contacto:
        $contact_subtypes = Category::where('company_id', $currentCompanyId)
        ->where('module', 'users')
        ->where('status', 1)
        ->where('depth', '0')
        ->orderBy('name', 'ASC')
        ->get();

        // importante para el front (rutas)
        $slug = $leads ? 'crm-leads' : 'crm-contacts';

        // Modo "builder" para crear miembros de una lista de marketing desde contactos
        $builderListId = (int) $request->input('marketing_list_id', 0);
        $builderMode   = $request->boolean('build_marketing_list') && $builderListId > 0;
        $builderList   = null;

        if ($builderMode) {
            $builderList = MarketingList::query()
                ->where('company_id', $currentCompanyId)
                ->where('id', $builderListId)
                ->first();

            if (!$builderList) {
                $builderMode = false;
            }
        }

        return Inertia::render('Admin/CrmContact/Index', [
            "title"               => __($this->option),
            "subtitle"            => $leads ? __('clientes_potenciales') : __('contactos'),
            "module"              => $this->module,
            "slug"                => $slug,
            "table"               => [
                'id'                    => 'tblContacts',
                'rows'                  => UserResource::collection($contacts, 'crm-contact'),
                'meta'                  => $contacts->toArray()['meta'] ?? null, // o el meta que ya mandas
                'queryParams'           => request()->query() ?: [],
                'permissions'           => $this->permissions,
                'columnPreferences'     => UserColumnPreference::forUserAndTables(
                    Auth::id(),
                    ['tblContacts']
                ),
                'adhocFilters'          => $this->adHocFilterUiConfig($currentCompanyId),
                'activeFiltersLegend'   => $this->activeFiltersLegend($request),   
            ],
            "permissions"         => $this->permissions,
            "salutations"         => $salutations,
            "contact_types"       => $contact_types,
            "contact_types_combo" => $contact_types_combo,
            "contact_subtypes"    => $contact_subtypes,
            "leads"               => $leads,
            "countries" => Cache::remember('countries_select', now()->addDay(), function () {
                return Country::query()->orderBy('name')->get(['id','name']);
            }),
            "availableLocales"    => LocaleTrait::availableLocales(),
            "builderMode"         => $builderMode,
            "builderList"         => $builderList
        ]);
    }

    /**
     * 1.1. Contactos para exportación.
     */
    public function filteredData(UserFilterRequest $request)
    {
        $company_id = $request->input('company_id', session('currentCompany'));

        // /admin/crm-leads → segment(2) = 'crm-leads'
        $leads = $request->segment(2) === 'crm-leads';

        // Aseguramos que dataQuery tiene todo
        $request->merge([
            'company_id' => $company_id,
            'leads'      => $leads,
        ]);

        $cacheKey = 'filtered_contacts_' . $company_id . '_' . ($leads ? 'leads' : 'contacts') . '_' . md5(json_encode($request->all()));

        $users = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'rows' => UserResource::collection($users, 'crm-contact'),
        ]);
    }

    /**
     * 1.2. Data Query contactos.
     *
     * 09/12/2025: se ha modificado la consulta para obtener sólo CRM Contactos, omitiendo los relacionados con Customer Providers. Considerar su inclusión en un futuro.
     */
    private function dataQuery(Request $request): Builder
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $company_id = (int) $request->input('company_id', $currentCompanyId);

        // leads: /admin/crm-leads o parámetro "leads"
        $leads = filter_var($request->input('leads', false), FILTER_VALIDATE_BOOLEAN);
        if (!$request->has('leads') && $request->segment(2) === 'crm-leads') {
            $leads = true;
        }

        /**
         * 1) Query base: users JOIN crm_contacts (empresa en sesión)
         */
        $query = User::query()
            ->from('users')
            ->join('crm_contacts as cc', function ($j) use ($company_id, $leads) {
                $j->on('cc.user_id', '=', 'users.id')
                  ->where('cc.company_id', '=', $company_id)
                  ->whereNull('cc.deleted_at');

                if ($leads) {
                    $j->where('cc.contact_type', '=', 'clp');
                }
            })
            ->whereNull('users.deleted_at')
            ->with(['avatar', 'phones', 'categories', 'companies', 'emails']);

        /**
         * 2) SELECT + agregados solo sobre crm_contacts
         */
        $query->select([
            'users.id',
            'users.name',
            'users.surname',
            'users.email',
            'users.status',

            // De momento sin lógica de empresa distinta / cuenta CRM:
            DB::raw('NULL as edit_company_id'),
            DB::raw('NULL as edit_crm_account_id'),

            // Agregados básicos de crm_contacts
            DB::raw('MIN(cc.position)     as position'),
            DB::raw('MIN(cc.department)   as department'),
            DB::raw('MAX(cc.contact_type) as contact_type'),
            // Fecha de alta del contacto CRM (p. ej. clientes potenciales / leads)
            DB::raw('MIN(cc.created_at) as crm_contact_created_at'),
        ])
        ->groupBy(
            'users.id',
            'users.name',
            'users.surname',
            'users.email',
            'users.status',
        );

        /**
         * 3) Filtros específicos que dependen del front:
         *    - full_name (columna "Nombre")
         *    - companies (columna "Empresa")
         */

        // full_name: filtro de la columna "Nombre"
        // En DB no existe full_name, así que buscamos por name + surname
        $fullNameFilter = $request->input('full_name');
        $fullNameFilter = is_string($fullNameFilter) ? trim($fullNameFilter) : '';

        if ($fullNameFilter !== '') {
            $query->whereRaw("
                CONCAT(
                    TRIM(COALESCE(users.name, '')),
                    ' ',
                    TRIM(COALESCE(users.surname, ''))
                ) LIKE ?
            ", [WildcardPattern::toLike($fullNameFilter)]);
        }

        // companies: filtro de la columna "Empresa"
        // Buscamos por companies.name o companies.tradename
        $companiesFilter = $request->input('companies');
        $companiesFilter = is_string($companiesFilter) ? trim($companiesFilter) : '';

        if ($companiesFilter !== '') {
            $like = WildcardPattern::toLike($companiesFilter);
            $query->whereHas('companies', function ($sub) use ($like) {
                $sub->where(function ($qq) use ($like) {
                    $qq->where('companies.name', 'like', $like)
                       ->orWhere('companies.tradename', 'like', $like);
                });
            });
        }

        /**
         * 4) Resto de filtros (los que sí iban bien):
         *    email, position, contact_type, contact_subtype, categories (texto).
         */
        $filters = [
            'email' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }
                $q->where('users.email', 'like', WildcardPattern::toLike($v));
            },

            // Sólo posición de contacto (crm_contacts)
            'position' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }

                $q->where('cc.position', 'like', WildcardPattern::toLike($v));
            },

            'contact_type' => function ($q, $v) {
                if ($v === null || $v === '') {
                    return;
                }
                $q->where('cc.contact_type', $v);
            },

            // Subtipo de contacto: por categoría concreta (id)
            'contact_subtype' => function ($q, $v) use ($company_id) {
                if (!$v) {
                    return;
                }

                $q->whereHas('categories', function ($sub) use ($v, $company_id) {
                    $sub->when($company_id !== 'all', function ($qq) use ($company_id) {
                            $qq->where('categories.company_id', $company_id);
                        })
                        ->where('categories.id', $v);
                });
            },

            // Texto libre sobre nombre de categorías (si lo usas)
            'categories' => function ($q, $v) use ($company_id) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }

                $q->whereHas('categories', function ($sub) use ($company_id, $v) {
                    $sub->when($company_id !== 'all', function ($qq) use ($company_id) {
                            $qq->where('categories.company_id', $company_id);
                        })
                        ->where('categories.module', 'users')
                        ->where('categories.name', 'like', WildcardPattern::toLike($v));
                });
            },

            // Filtro por teléfono (columna "Teléfonos" en la tabla)
            'phones' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }
                $q->whereHas('phones', function ($sub) use ($v) {
                    $sub->where('e164', 'like', WildcardPattern::toLike($v));
                });
            },

            // Filtro por otros emails (columna "Otros emails")
            'other_emails' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }
                $q->whereHas('emails', function ($sub) use ($v) {
                    $sub->where('email', 'like', WildcardPattern::toLike($v));
                });
            },
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        /**
         * 5) Rango de fechas (created_at de users)
         */
        $from = $request->input('date_from');
        $to   = $request->input('date_to');

        if ($from && $to) {
            $query->whereBetween('users.created_at', ["$from 00:00:00", "$to 23:59:59"]);
        } elseif ($from) {
            $query->where('users.created_at', '>=', "$from 00:00:00");
        } elseif ($to) {
            $query->where('users.created_at', '<=', "$to 23:59:59");
        }

        // Filtros avanzados:
        $query->applyAdhocFilters($request, $this->adHocFilterDefinitions($company_id));

        /**
         * 6) Orden
         */
        $sortField     = $request->input('sort_field', 'full_name');
        $sortDirection = strtoupper($request->input('sort_direction', 'ASC'));
        if (!in_array($sortDirection, ['ASC', 'DESC'], true)) {
            $sortDirection = 'ASC';
        }
        $allowedSortFields = ['full_name', 'name', 'surname', 'email'];

        if (!in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'full_name';
        }

        if ($sortField === 'full_name') {
            // Orden coherente con el valor mostrado por UserResource:
            // full_name = name + ' ' + surname (nombre primero, apellido después)
            return $query->orderByRaw(
                "CONCAT(TRIM(COALESCE(users.name, '')), ' ', TRIM(COALESCE(users.surname, ''))) {$sortDirection}"
            );
        }

        return $query->orderBy("users.$sortField", $sortDirection);
    }

    /**
     * 1.3. Definición de filtros avanzados.
     */
    private function adHocFilterDefinitions(string|int $company_id): array
    {
        $addressRel = 'addresses';

        return [
            'sex' => [
                'rules' => ['nullable'],
                'apply' => function (Builder $q, $v) {
                    if (is_array($v)) {
                        $v = $v['value'] ?? null;
                    }
                    if (!$v) return;

                    $q->where('sex', $v);
                },
            ],

            'nif' => [
                'rules' => ['nullable', 'string', 'max:50'],
                'apply' => function (Builder $q, $v) {
                    $v = trim((string)$v);
                    if ($v === '') return;
                    $q->where('nif', 'like', "%$v%");
                },
            ],

            'created_between' => [
                'rules' => ['nullable', 'array'],
                'apply' => function (Builder $q, $v) {
                    $from = $v['from'] ?? null;
                    $to   = $v['to']   ?? null;

                    if ($from && $to) {
                        $q->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"]);
                    } elseif ($from) {
                        $q->where('created_at', '>=', "$from 00:00:00");
                    } elseif ($to) {
                        $q->where('created_at', '<=', "$to 23:59:59");
                    }
                },
            ],

            'birthday_between' => [
                'rules' => ['nullable', 'array'],
                'apply' => function (Builder $q, $v) {
                    $from = $v['from'] ?? null;
                    $to   = $v['to']   ?? null;

                    if ($from && $to) {
                        $q->whereBetween('birthday', [$from, $to]);
                    } elseif ($from) {
                        $q->where('birthday', '>=', $from);
                    } elseif ($to) {
                        $q->where('birthday', '<=', $to);
                    }
                },
            ],

            'address' => [
                'rules' => ['nullable', 'string', 'max:255'],
                'apply' => function (Builder $q, $v) use ($addressRel) {
                    $v = trim((string)$v);
                    if ($v === '') return;

                    $q->whereHas($addressRel, function ($sub) use ($v) {
                        $sub->where(function ($w) use ($v) {
                            $w->where('address', 'like', "%$v%")
                              ->orWhere('address_extra', 'like', "%$v%");
                        });
                    });
                },
            ],

            'town_id' => [
                'rules' => ['nullable', 'integer'],
                'apply' => function (Builder $q, $v) {
                    if (!$v) return;
                    $q->whereHas('addresses', function ($sub) use ($v) {
                        $sub->where('town_id', $v);
                    });
                },
            ],

            'province_id' => [
                'rules' => ['nullable', 'integer'],
                'apply' => function (Builder $q, $v) {
                    if (!$v) return;
                    $q->whereHas('addresses.town', function ($sub) use ($v) {
                        $sub->where('province_id', $v);
                    });
                },
            ],

            'country_id' => [
                'rules' => ['nullable', 'integer'],
                'apply' => function (Builder $q, $v) {
                    if (!$v) return;
                    $q->whereHas('addresses.town.province', function ($sub) use ($v) {
                        $sub->where('country_id', $v);
                    });
                },
            ],

            'cp' => [
                'rules' => ['nullable', 'string', 'max:10'],
                'apply' => function (Builder $q, $v) {
                    $v = trim((string)$v);
                    if ($v === '') return;

                    $q->whereHas('addresses', function ($sub) use ($v) {
                        if (strlen($v) >= 5) {
                            $sub->where('cp', $v);
                        } else {
                            $sub->where('cp', 'like', $v.'%');
                        }
                    });
                },
            ],

            'business_type' => [
                'rules' => ['nullable', 'integer'],
                'apply' => function (Builder $q, $v) use ($company_id) {
                    if (!$v) return;

                    $q->whereExists(function ($sub) use ($v, $company_id) {
                        $sub->select(DB::raw(1))
                            ->from('crm_contacts as cc2')
                            ->whereColumn('cc2.user_id', 'users.id')
                            ->where('cc2.company_id', $company_id)
                            ->where('cc2.business_type', $v);
                    });
                },
            ],

            'cost_center_id' => [
                'rules' => ['nullable', 'integer'],
                'apply' => function (Builder $q, $v) use ($company_id) {
                    if (!$v) return;

                    $q->whereHas('costCenters', function ($sub) use ($v, $company_id) {
                        $sub->where('user_cost_centers.company_id', $company_id)
                            ->where('user_cost_centers.cost_center_id', $v);
                    });
                },
            ],

            'last_year_service' => [
                'rules' => ['nullable', 'integer'],
                'apply' => function (Builder $q, $v) use ($company_id) {
                    if (!$v) return;

                    $q->whereExists(function ($sub) use ($v, $company_id) {
                        $sub->select(DB::raw(1))
                            ->from('crm_contacts as cc2')
                            ->whereColumn('cc2.user_id', 'users.id')
                            ->where('cc2.company_id', $company_id)
                            ->where('cc2.last_year_service', $v);
                    });
                },
            ],
        ];
    }

    /**
     * 1.4. Configuración de filtros avanzados.
     */
    private function adHocFilterUiConfig(string|int $company_id): array
    {
        return [
            [
                'key' => 'sex',
                'label' => __('sexo'),
                'type' => 'select',
                'multiple' => false,
                'options' => [
                    ['value' => 'h', 'label' => __('hombre')],
                    ['value' => 'm', 'label' => __('mujer')],
                    ['value' => 'o', 'label' => __('otro')],
                ],
            ],
            [
                'key' => 'nif',
                'label' => __('nif'),
                'type' => 'text',
            ],
            [
                'key' => 'created_between',
                'label' => __('alta'),
                'type' => 'daterange',
            ],
            [
                'key' => 'birthday_between',
                'label' => __('aniversario'),
                'type' => 'daterange',
            ],
            [
                'key' => 'address',
                'label' => __('direccion'),
                'type' => 'text',
            ],
            [
                'key'   => 'business_type',
                'label' => __('tipo_negocio'),
                'type'  => 'select',
                'multiple' => false,
                'options'  => HasBusinessTypes::comboOptions(),
            ],
            [
                'key'   => 'cost_center_id',
                'label' => __('centro_coste'),
                'type'  => 'select',
                'multiple' => false,
                'options'  => $this->costCenterOptionsForCompany($company_id),
                'colClass' => 'col-12 col-md-6 col-xl-4',
            ],
            [
                'key'     => 'last_year_service',
                'label'   => __('ultimo_servicio_any'),
                'type'    => 'year_select',
                'minYear' => 2000,
                'maxYear' => (int) date('Y'),
                'colClass'=> 'col-12 col-md-6 col-xl-4',
            ],
            [
                'key' => 'location',
                'label' => __('ubicacion'),
                'type' => 'location_selects',
                'colClass' => 'col-12',
                'countryKey' => 'country_id',
                'provinceKey' => 'province_id',
                'townKey' => 'town_id',
                'cpKey' => 'cp'
            ],
        ];
    }

    /**
     * Centros de coste activos para la empresa (opciones de select).
     */
    private function costCenterOptionsForCompany(string|int $company_id): array
    {
        $list = CostCenter::query()
            ->where('company_id', $company_id)
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        return $list->map(fn ($cc) => [
            'value' => (int) $cc->id,
            'label' => $cc->name,
        ])->values()->all();
    }

    /**
     * 1.5. Leyenda de filtros aplicados.
     */
    private function activeFiltersLegend(Request $request): array
    {
        $legend = [];

        // Cabecera (ajústalo cuando vea Index.jsx)
        foreach ([
            'full_name'      => __('nombre'),
            'email'          => __('email'),
            'position'       => __('cargo'),
            'contact_type'   => __('contacto_tipo'),
            'companies'      => __('empresa'),
            'contact_subtype'=> __('contacto_subtipo'),
            'categories'     => __('categoria'),
        ] as $key => $label) {
            if ($request->filled($key)) {
                $legend[] = [
                    'key'   => "header.$key",
                    'scope' => 'header',
                    'path'  => $key,
                    'label' => $label,
                    'value' => $request->input($key),
                ];
            }
        }

        // Adhoc
        $adhoc = $request->input('adhoc', []);
        $adhoc = is_array($adhoc) ? $adhoc : [];

        $hasText = static fn(string $k) => isset($adhoc[$k]) && trim((string)$adhoc[$k]) !== '';

        // sex (legacy soporte)
        $sex = $adhoc['sex'] ?? null;
        if (is_array($sex)) $sex = $sex['value'] ?? null;
        $sex = is_string($sex) ? trim($sex) : $sex;

        if ($sex) {
            $sexMap = ['m' => __('mujer'), 'h' => __('hombre'), 'o' => __('otro')];
            $legend[] = [
                'key'   => 'adhoc.sex',
                'scope' => 'adhoc',
                'path'  => 'sex',
                'label' => __('sexo'),
                'value' => $sexMap[$sex] ?? $sex,
            ];
        }

        if ($hasText('nif')) {
            $legend[] = [
                'key'   => 'adhoc.nif',
                'scope' => 'adhoc',
                'path'  => 'nif',
                'label' => __('nif'),
                'value' => trim((string)$adhoc['nif']),
            ];
        }

        if ($hasText('address')) {
            $legend[] = [
                'key'   => 'adhoc.address',
                'scope' => 'adhoc',
                'path'  => 'address',
                'label' => __('direccion'),
                'value' => trim((string)$adhoc['address']),
            ];
        }

        if ($hasText('cp')) {
            $legend[] = [
                'key'   => 'adhoc.cp',
                'scope' => 'adhoc',
                'path'  => 'cp',
                'label' => __('cp'),
                'value' => trim((string)$adhoc['cp']),
            ];
        }

        // Rangos
        $addRange = function (string $key, string $label) use (&$legend, $adhoc) {
            if (!isset($adhoc[$key]) || !is_array($adhoc[$key])) return;

            $from = isset($adhoc[$key]['from']) ? trim((string)$adhoc[$key]['from']) : null;
            $to   = isset($adhoc[$key]['to'])   ? trim((string)$adhoc[$key]['to'])   : null;

            if ($from !== '' || $to !== '') {
                $value = trim(($from ?: '') . ' — ' . ($to ?: ''));
                $legend[] = [
                    'key'   => "adhoc.$key",
                    'scope' => 'adhoc',
                    'path'  => $key,
                    'label' => $label,
                    'value' => $value,
                ];
            }
        };

        $addRange('created_between', __('alta'));
        $addRange('birthday_between', __('aniversario'));

        // business_type
        $businessTypeId = $adhoc['business_type'] ?? null;
        $businessTypeId = is_numeric($businessTypeId) ? (int) $businessTypeId : null;
        if ($businessTypeId) {
            $label = HasBusinessTypes::typesOf((string) $businessTypeId) ?? (string) $businessTypeId;
            $legend[] = [
                'key'   => 'adhoc.business_type',
                'scope' => 'adhoc',
                'path'  => 'business_type',
                'label' => __('tipo_negocio'),
                'value' => $label,
            ];
        }

        // cost_center_id
        $costCenterId = $adhoc['cost_center_id'] ?? null;
        $costCenterId = is_numeric($costCenterId) ? (int) $costCenterId : null;
        if ($costCenterId) {
            $name = Cache::remember("cost_center_name_{$costCenterId}", now()->addDays(7), function () use ($costCenterId) {
                return CostCenter::whereKey($costCenterId)->value('name');
            }) ?? (string) $costCenterId;

            $legend[] = [
                'key'   => 'adhoc.cost_center_id',
                'scope' => 'adhoc',
                'path'  => 'cost_center_id',
                'label' => __('centro_coste'),
                'value' => $name,
            ];
        }

        // last_year_service
        $lastYearService = $adhoc['last_year_service'] ?? null;
        $lastYearService = is_numeric($lastYearService) ? (int) $lastYearService : null;
        if ($lastYearService) {
            $legend[] = [
                'key'   => 'adhoc.last_year_service',
                'scope' => 'adhoc',
                'path'  => 'last_year_service',
                'label' => __('ultimo_servicio_any'),
                'value' => (string) $lastYearService,
            ];
        }

        // Ubicación (cache por ID)
        $countryId  = $adhoc['country_id']  ?? null;
        $provinceId = $adhoc['province_id'] ?? null;
        $townId     = $adhoc['town_id']     ?? null;

        $countryId  = is_numeric($countryId)  ? (int)$countryId  : null;
        $provinceId = is_numeric($provinceId) ? (int)$provinceId : null;
        $townId     = is_numeric($townId)     ? (int)$townId     : null;

        if ($countryId) {
            $name = Cache::remember("country_name_$countryId", now()->addDays(7), function () use ($countryId) {
                return Country::whereKey($countryId)->value('name');
            }) ?? (string)$countryId;

            $legend[] = [
                'key'   => 'adhoc.country_id',
                'scope' => 'adhoc',
                'path'  => 'country_id',
                'label' => __('pais'),
                'value' => $name,
            ];
        }

        if ($provinceId) {
            $name = Cache::remember("province_name_$provinceId", now()->addDays(7), function () use ($provinceId) {
                return Province::whereKey($provinceId)->value('name');
            }) ?? (string)$provinceId;

            $legend[] = [
                'key'   => 'adhoc.province_id',
                'scope' => 'adhoc',
                'path'  => 'province_id',
                'label' => __('provincia'),
                'value' => $name,
            ];
        }

        if ($townId) {
            $name = Cache::remember("town_name_$townId", now()->addDays(7), function () use ($townId) {
                return Town::whereKey($townId)->value('name');
            }) ?? (string)$townId;

            $legend[] = [
                'key'   => 'adhoc.town_id',
                'scope' => 'adhoc',
                'path'  => 'town_id',
                'label' => __('poblacion'),
                'value' => $name,
            ];
        }

        return $legend;
    }

    /**
     * 2. Nuevos contactos.
     * 
     * Obtener nuevos contactos (validated IS NULL) para la empresa en sesión.
     * Devuelve el usuario relacionado y el último mensaje (si lo hay).
     */
    public function newContacts(Request $request)
    {
        $company_id = session('currentCompany');

        $contacts = CrmContact::query()
            ->with(['user', 'messages' => function ($q) {
                $q->orderByDesc('created_at');
            }])
            ->where('company_id', $company_id)
            ->whereNull('validated')
            ->whereIn('contact_type', ['clp', 'otrc', 'newl'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'created_at' => $c->created_at->toDateTimeString(),
                    'contact_type' => $c->contact_type,
                    'user' => $c->user ? [
                        'id' => $c->user->id,
                        'name' => trim(($c->user->name ?? '') . ' ' . ($c->user->surname ?? '')),
                        'email' => $c->user->email,
                    ] : null,
                    'last_message' => $c->messages && $c->messages->count() ? $c->messages->first()->message ?? null : null,
                ];
            });

        return response()->json(['contacts' => $contacts]);
    }

    /**
     * Descarga archivo de prueba para importación (600 registros, misma estructura que la plantilla).
     */
    public function importSample(Request $request, CrmContactImportSampleGenerator $generator)
    {
        return $generator->downloadResponse(600, 'contactos-import-muestra-600.xlsx');
    }

    /**
     * 3. Eliminar / desvincular un contacto CRM.
     */
    public function destroy(Request $request, CrmContact $contact)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        // Seguridad multiempresa: el contacto debe pertenecer a la empresa activa
        if ($currentCompanyId <= 0 || $contact->company_id !== $currentCompanyId) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('alert', __('empresa_no_activa'));
            }
            return response()->json(['message' => 'Not found'], 404);
        }

        $crmAccountId = $contact->crm_account_id; // lo necesitamos después del delete
        $userId = $contact->user_id;

        try {
            $contact->delete();

            // Eliminar también el vínculo user_companies creado al añadir este contacto
            if ($userId && $crmAccountId) {
                $account = CrmAccount::find($crmAccountId);
                if ($account && $account->linked_company_id) {
                    UserCompany::where('user_id', $userId)
                        ->where('company_id', $account->linked_company_id)
                        ->delete();
                }
            }
        } catch (\Throwable $e) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('alert', __('error_eliminar_contacto'));
            }
            return response()->json(['message' => 'Error deleting'], 500);
        }

        // Peticiones Inertia (como las que vienen de TableUsers) esperan un redirect, no JSON
        if ($request->header('X-Inertia')) {
            if ($crmAccountId) {
                // Volver a la pestaña de usuarios de la cuenta CRM
                return redirect()
                    ->route('crm-accounts.edit', [$crmAccountId, 'users'])
                    ->with('msg', __('contacto_desvinculado_ok'));
            }

            // Fallback genérico: volver atrás
            return redirect()->back()->with('msg', __('contacto_eliminado_ok'));
        }

        // API no-Inertia: respuesta JSON simple
        return response()->json(['message' => 'OK']);
    }

    /**
     * 4. Formulario importación de contactos.
     */
    public function import(Request $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if ($currentCompanyId <= 0) {
            return redirect()->route('companies.refresh-session')
                ->with('alert', __('empresa_no_activa'));
        }

        $leads = $request->segment(2) === 'crm-leads';
        // importante para el front (rutas)
        $slug = $leads ? 'crm-leads' : 'crm-contacts';

        return Inertia::render('Admin/CrmContact/Import', [
            'title'         => __($this->option),
            'subtitle'      => __('contactos_importar'),
            'module'        => $this->module,
            'slug'          => $slug,
            'permissions'   => $this->permissions,
            'templateUrl'   => route('crm-contacts.import.template'),
            'import_result' => session('import_result'),
        ]);
    }

    /**
     * 5. Template .xls para importación de contactos.
     */
    public function importTemplate(Request $request)
    {
        $path = 'templates/contactos-import.xls';
        if (!Storage::disk('local')->exists($path)) {
            abort(404, __('plantilla_no_encontrada'));
        }
        return Storage::disk('local')->download($path, 'contactos-import.xls', [
            'Content-Type' => 'application/vnd.ms-excel',
        ]);
    }

    /**
     * 6. Importar contactos.
     */
    public function importStore(Request $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if ($currentCompanyId <= 0) {
            if ($request->header('X-Inertia')) {
                return Inertia::location(route('companies.refresh-session'));
            }
            return redirect()->route('companies.refresh-session')->with('alert', __('empresa_no_activa'));
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:xls,xlsx', 'max:2048'],
        ], [
            'file.required' => __('import_archivo_requerido'),
            'file.mimes'    => __('import_formato_invalido'),
            'file.max'     => __('import_tamano_maximo'),
        ]);

        $file = $request->file('file');
        $totalProcessed = 0;
        $totalFailed = 0;
        $failedRows = [];

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['file' => __('import_error_lectura') . ' ' . $e->getMessage()]);
        }

        if (count($rows) < 2) {
            return redirect()->back()->withErrors(['file' => __('import_archivo_vacio')]);
        }

        $headerRow = array_map(function ($c) {
            return trim(is_string($c) ? $c : '');
        }, $rows[0]);
        $dataRows = array_slice($rows, 1);
        if (count($dataRows) > 1000) {
            return redirect()->back()->withErrors(['file' => __('import_max_filas')]);
        }

        $colIndex = array_flip($headerRow);
        $expectedCols = ['name', 'surname', 'user_email', 'user_nif', 'user_phone1', 'user_phone2', 'position', 'department', 'observations', 'company', 'company_nif', 'company_city', 'company_postal_code', 'company_street', 'company_phone', 'company_email', 'account', 'contact_type', 'contact_subtype'];
        foreach ($expectedCols as $col) {
            if (!isset($colIndex[$col])) {
                $colIndex[$col] = null;
            }
        }

        $userId = Auth::id();

        foreach ($dataRows as $rowIndex => $row) {
            $excelRowNum = $rowIndex + 2;
            $assoc = [];
            foreach ($colIndex as $colName => $idx) {
                if ($idx === null) {
                    $assoc[$colName] = '';
                } else {
                    $assoc[$colName] = isset($row[$idx]) ? $row[$idx] : '';
                }
            }
            $row = ImportContactRowNormalizer::normalizeRow($assoc);

            $name = $row['name'] ?? '';
            if ($name === '') {
                $failedRows[] = ['row' => $excelRowNum, 'reason' => __('import_sin_nombre'), 'data' => $assoc];
                $totalFailed++;
                continue;
            }

            try {
                DB::beginTransaction();

                $user = null;
                $email = $row['user_email'] ?? '';
                $nif = $row['user_nif'] ?? '';
                if ($email !== '') {
                    $user = User::where('email', $email)->first();
                }
                if ($user === null && $nif !== '') {
                    $user = User::where('nif', $nif)->first();
                }
                if ($user === null) {
                    $user = new User();
                    $user->name = $name;
                    $user->surname = $row['surname'] ?? '';
                    $user->email = $email ?: null;
                    $user->nif = $nif ?: null;
                    $user->isAdmin = false;
                    $user->status = true;
                    $user->save();
                }

                $crmAccount = null;
                $companyName = $row['company'] ?? '';
                $taxId = $row['company_nif'] ?? '';
                if ($companyName !== '' || $taxId !== '') {
                    if ($taxId !== '') {
                        $crmAccount = CrmAccount::where('company_id', $currentCompanyId)->where('tax_id', $taxId)->first();
                    }
                    if ($crmAccount === null && $companyName !== '') {
                        $crmAccount = new CrmAccount();
                        $crmAccount->company_id = $currentCompanyId;
                        $crmAccount->name = $companyName;
                        $crmAccount->normalized_name = Str::slug($companyName) ?: 'cuenta-' . $user->id;
                        $crmAccount->tax_id = $taxId ?: null;
                        $crmAccount->billing_city = $row['company_city'] ?? null;
                        $crmAccount->billing_postal_code = $row['company_postal_code'] ?? null;
                        $crmAccount->billing_street = $row['company_street'] ?? null;
                        $crmAccount->main_phone = $row['company_phone'] ?? null;
                        $crmAccount->main_email = $row['company_email'] ?? null;
                        $crmAccount->owner_id = $userId;
                        $crmAccount->created_by = $userId;
                        $crmAccount->updated_by = $userId;
                        $crmAccount->status = 1;
                        $crmAccount->save();
                    }
                }

                // Columna Q (account): búsqueda por nombre exacto en cuentas existentes (case-insensitive).
                // Si hay coincidencia única sobreescribe $crmAccount; si hay 0 o >1, se omite.
                $accountFromQ = null;
                $accountLabel = trim((string) ($row['account'] ?? ''));
                if ($accountLabel !== '') {
                    $accountMatches = CrmAccount::where('company_id', $currentCompanyId)
                        ->whereRaw('LOWER(name) = ?', [mb_strtolower($accountLabel, 'UTF-8')])
                        ->get();
                    if ($accountMatches->count() === 1) {
                        $accountFromQ = $accountMatches->first();
                        $crmAccount   = $accountFromQ;
                    }
                }

                $contact = CrmContact::where('company_id', $currentCompanyId)->where('user_id', $user->id)->first();
                if ($contact === null) {
                    $contact = new CrmContact();
                    $contact->company_id = $currentCompanyId;
                    $contact->user_id = $user->id;
                    $contact->crm_account_id = $crmAccount?->id;
                } elseif ($accountFromQ !== null) {
                    // Contacto existente: actualizar crm_account_id solo si la columna Q produjo coincidencia
                    $contact->crm_account_id = $accountFromQ->id;
                }

                // Siempre actualizar desde la fila importada (incluye reimportaciones)
                $contact->position = (($row['position'] ?? '') !== '') ? $row['position'] : null;
                $contact->department = (($row['department'] ?? '') !== '') ? $row['department'] : null;
                $contact->observations = (($row['observations'] ?? '') !== '') ? $row['observations'] : null;

                // Teléfonos del usuario (polimórfico phones → User)
                $phone1 = (string) ($row['user_phone1'] ?? '');
                $phone2 = (string) ($row['user_phone2'] ?? '');
                $this->syncImportPhonesForUser($user, $phone1, $phone2);

                // contact_type: valor en Excel es la etiqueta (ej. "clientes", "cliente potencial"); cotejar con el valor de typesMap y guardar el índice (slug)
                $contactTypeLabel = trim((string) ($row['contact_type'] ?? ''));
                if ($contactTypeLabel !== '') {
                    $typesMap = HasContactTypes::typesMap();
                    $labelNormalized = mb_strtolower($contactTypeLabel, 'UTF-8');
                    foreach ($typesMap as $slug => $label) {
                        if (mb_strtolower(trim((string) $label), 'UTF-8') === $labelNormalized) {
                            $contact->contact_type = $slug;
                            break;
                        }
                    }
                }

                // contact_subtype: valor en Excel es slug; resolver contra categories (module=users) y asociar al User
                $contactSubtypeSlug = trim((string) ($row['contact_subtype'] ?? ''));
                if ($contactSubtypeSlug !== '') {
                    $subtypeCategory = Category::where('company_id', $currentCompanyId)
                        ->where('module', 'users')
                        ->where('status', 1)
                        ->where('depth', '0')
                        ->where('slug', $contactSubtypeSlug)
                        ->first();
                    if ($subtypeCategory !== null) {
                        $user->categories()->syncWithoutDetaching([
                            $subtypeCategory->id => ['company_id' => $currentCompanyId],
                        ]);
                    }
                }

                $contact->save();

                DB::commit();
                $totalProcessed++;
            } catch (\Throwable $e) {
                DB::rollBack();
                $failedRows[] = ['row' => $excelRowNum, 'reason' => $e->getMessage(), 'data' => $assoc];
                $totalFailed++;
            }
        }

        return redirect()->route('crm-contacts.import')->with([
            'import_result' => [
                'success'         => $totalFailed === 0,
                'total_processed' => $totalProcessed,
                'total_failed'    => $totalFailed,
                'failed_rows'     => $failedRows,
            ],
        ]);
    }

    /**
     * Sincroniza user_phone1 / user_phone2 con phones (morph User). Si ambas columnas
     * vienen vacías no se tocan los teléfonos existentes. Si hay texto pero ningún
     * número es válido para E.164, tampoco se llama a sync (evita borrar todo al fallar el parseo).
     */
    private function syncImportPhonesForUser(User $user, string $p1, string $p2): void
    {
        $p1 = $this->normalizeImportPhoneString($p1);
        $p2 = $this->normalizeImportPhoneString($p2);

        if ($p1 === '' && $p2 === '') {
            return;
        }

        if (! $this->rowHasAtLeastOneValidPhoneNumber($p1, $p2)) {
            return;
        }

        $items = [];
        if ($p1 !== '') {
            $items[] = [
                'number'     => $p1,
                'type'       => 'mobile',
                'is_primary' => true,
            ];
        }
        if ($p2 !== '') {
            $items[] = [
                'number'     => $p2,
                'type'       => 'mobile',
                'is_primary' => $p1 === '',
            ];
        }

        if ($items === []) {
            return;
        }

        Phone::syncFor($user, $items, ['default_region' => 'ES']);
    }

    /** Misma lógica de espacios que Phone::trimAllWhitespace para coherencia con normalizeItems. */
    private function normalizeImportPhoneString(string $raw): string
    {
        $value = preg_replace('/\s+/u', '', $raw);

        return trim($value);
    }

    private function rowHasAtLeastOneValidPhoneNumber(string $p1, string $p2): bool
    {
        $util = PhoneNumberUtil::getInstance();
        $region = 'ES';

        foreach ([$p1, $p2] as $raw) {
            $raw = $this->normalizeImportPhoneString($raw);
            if ($raw === '') {
                continue;
            }
            try {
                $parsed = $util->parse($raw, $region);
                if ($util->isValidNumber($parsed)) {
                    return true;
                }
            } catch (\Throwable $e) {
                continue;
            }
        }

        return false;
    }
}
