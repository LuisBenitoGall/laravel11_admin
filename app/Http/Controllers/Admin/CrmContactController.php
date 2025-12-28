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
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Concerns:
use App\Concerns\HasContactTypes;
use App\Concerns\HasSalutation;

//Models:
use App\Models\Category;
use App\Models\Company;
use App\Models\Country;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\CustomerProvider;
use App\Models\MarketingList;
use App\Models\Province;
use App\Models\Town;
use App\Models\User;
use App\Models\UserColumnPreference;

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
        
        // /admin/crm-leads → segment(2) = 'crm-leads'
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
            "contacts"            => UserResource::collection($contacts),
            "salutations"         => $salutations,
            "contact_types"       => $contact_types,
            "contact_types_combo" => $contact_types_combo,
            "contact_subtypes"    => $contact_subtypes,
            "leads"               => $leads,
            "countries" => Cache::remember('countries_select', now()->addDay(), function () {
                return Country::query()->orderBy('name')->get(['id','name']);
            }),
            "queryParams"         => request()->query() ?: null,
            "adhocFilters"        => $this->adHocFilterUiConfig(),
            "activeFiltersLegend" => $this->activeFiltersLegend($request),
            "availableLocales"    => LocaleTrait::availableLocales(),
            "permissions"         => $this->permissions,
            "columnPreferences"   => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblContacts']
            ),
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
            'users' => UserResource::collection($users),
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

        Log::debug('CRM contacts dataQuery', [
    'company_id_param'   => $request->input('company_id'),
    'company_id_cast'    => $company_id,
    'current_company_id' => $currentCompanyId,
]);


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
                  ->where('cc.company_id', '=', $company_id);

                if ($leads) {
                    $j->where('cc.contact_type', '=', 'clp');
                }
            })
            ->whereNull('users.deleted_at')
            ->with(['avatar', 'phones', 'categories', 'companies']);

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
            ", ["%{$fullNameFilter}%"]);
        }

        // companies: filtro de la columna "Empresa"
        // Buscamos por companies.name o companies.tradename
        $companiesFilter = $request->input('companies');
        $companiesFilter = is_string($companiesFilter) ? trim($companiesFilter) : '';

        if ($companiesFilter !== '') {
            $query->whereHas('companies', function ($sub) use ($companiesFilter) {
                $sub->where(function ($qq) use ($companiesFilter) {
                    $qq->where('companies.name', 'like', "%{$companiesFilter}%")
                       ->orWhere('companies.tradename', 'like', "%{$companiesFilter}%");
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
                $q->where('users.email', 'like', "%{$v}%");
            },

            // Sólo posición de contacto (crm_contacts)
            'position' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }

                $q->where('cc.position', 'like', "%{$v}%");
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
                        ->where('categories.name', 'like', "%{$v}%");
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
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'surname', 'email'];

        if (!in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'name';
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
        ];
    }

    /**
     * 1.4. Configuración de filtros avanzados.
     */
    private function adHocFilterUiConfig(): array
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
     * 3. Eliminar un contacto CRM.
     */
    public function destroy($contact)
    {
        $c = CrmContact::find($contact);
        if (!$c) {
            return response()->json(['message' => 'Not found'], 404);
        }

        try {
            $c->delete();
            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting'], 500);
        }
    }
}
