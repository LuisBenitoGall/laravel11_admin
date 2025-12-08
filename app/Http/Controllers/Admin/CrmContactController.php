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
                'crm-contacts.update'
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
        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            // si quieres ser fino, guarda a dónde quería ir originalmente
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

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
            "queryParams"         => request()->query() ?: null,
            "availableLocales"    => LocaleTrait::availableLocales(),
            "permissions"         => $this->permissions,
            "columnPreferences"   => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblContacts']
            ),
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

        $cacheKey = 'filtered_contacts_' . $company_id . '_' . md5(json_encode($request->all()));

        $users = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * 1.2. Data Query contactos.
     */
    private function dataQuery(Request $request): Builder
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if ($currentCompanyId <= 0) {
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if ($request->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        $company_id = (int) $request->input('company_id', $currentCompanyId);

        // leads: /admin/crm-leads o parámetro "leads"
        $leads = filter_var($request->input('leads', false), FILTER_VALIDATE_BOOLEAN);
        if (!$request->has('leads') && $request->segment(2) === 'crm-leads') {
            $leads = true;
        }

        /**
         * 1) Empresas relacionadas vía customer_providers (clientes/proveedores)
         */
        $relatedCompanyIds = CustomerProvider::query()
            ->where(function ($q) use ($company_id) {
                $q->where('customer_id', $company_id)
                  ->orWhere('provider_id', $company_id);
            })
            ->get()
            ->flatMap(fn ($cp) => [$cp->customer_id, $cp->provider_id])
            ->filter(fn ($id) => !is_null($id) && $id != $company_id)
            ->unique()
            ->values()
            ->all();

        /**
         * 2) Query base
         */
        $query = User::query()
            ->from('users')
            // empresa distinta de la de sesión (para position/department de empresa)
            ->leftJoin('user_companies as uc', function ($j) use ($company_id) {
                $j->on('uc.user_id', '=', 'users.id')
                  ->where('uc.company_id', '!=', $company_id);
            })
            // cuenta CRM vinculada (para edit_crm_account_id)
            ->leftJoin('crm_accounts as ca', function ($j) use ($company_id) {
                $j->on('ca.linked_company_id', '=', 'uc.company_id')
                  ->where('ca.company_id', '=', $company_id);
            })
            // contactos CRM para la empresa en sesión (para contact_type + position/department de contacto)
            ->leftJoin('crm_contacts as cc', function ($j) use ($company_id, $leads) {
                $j->on('cc.user_id', '=', 'users.id')
                  ->where('cc.company_id', '=', $company_id);

                if ($leads) {
                    $j->where('cc.contact_type', '=', 'clp');
                }
            })
            ->with(['avatar', 'phones', 'categories'])
            ->whereNull('users.deleted_at');

        /**
         * 2.1) QUIÉN ENTRA EN EL LISTADO
         *     Se hace con EXISTS, nada de whereIn ni userIds.
         */
        $query->where(function ($outer) use ($company_id, $relatedCompanyIds, $leads) {
            if ($leads) {
                // LEADS: sólo contactos CRM clp en esta empresa
                $outer->whereExists(function ($sub) use ($company_id) {
                    $sub->from('crm_contacts as c2')
                        ->whereColumn('c2.user_id', 'users.id')
                        ->where('c2.company_id', $company_id)
                        ->where('c2.contact_type', 'clp');
                });
            } else {
                // CONTACTOS:
                // a) usuarios con contacto CRM en esta empresa
                $outer->whereExists(function ($sub) use ($company_id) {
                    $sub->from('crm_contacts as c2')
                        ->whereColumn('c2.user_id', 'users.id')
                        ->where('c2.company_id', $company_id);
                });

                // b) o usuarios vinculados a empresas relacionadas
                if (!empty($relatedCompanyIds)) {
                    $outer->orWhereExists(function ($sub) use ($company_id, $relatedCompanyIds) {
                        $sub->from('user_companies as uc2')
                            ->whereColumn('uc2.user_id', 'users.id')
                            ->where('uc2.company_id', '!=', $company_id)
                            ->whereIn('uc2.company_id', $relatedCompanyIds);
                    });
                }
            }
        });

        /**
         * 3) SELECT + agregados
         */
        $query->select([
            'users.id',
            'users.name',
            'users.surname',
            'users.email',
            'users.status',

            DB::raw('MIN(uc.company_id)   as edit_company_id'),
            DB::raw('MIN(ca.id)           as edit_crm_account_id'),
            DB::raw('COALESCE(MIN(uc.position),   MIN(cc.position))   as position'),
            DB::raw('COALESCE(MIN(uc.department), MIN(cc.department)) as department'),
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
         * 4) Filtros
         */
        $filters = [
            'name' => function ($q, $v) {
                $v = trim($v);
                if ($v === '') {
                    return;
                }

                $q->whereRaw("
                    CONCAT(
                        TRIM(COALESCE(users.name, '')),
                        ' ',
                        TRIM(COALESCE(users.surname, ''))
                    ) LIKE ?
                ", ["%{$v}%"]);
            },

            'email' => fn ($q, $v) => $q->where('users.email', 'like', "%$v%"),

            'phones' => function ($q, $v) {
                $q->whereHas('phones', fn ($sub) => $sub->where('phone_number', 'like', "%$v%"));
            },

            'categories' => function ($q, $v) use ($company_id) {
                $q->whereHas('categories', function ($sub) use ($company_id, $v) {
                    if ($company_id !== 'all') {
                        $sub->where('categories.company_id', $company_id);
                    }
                    $sub->where('categories.module', 'users')
                        ->where('categories.name', 'like', "%$v%");
                });
            },

            'position' => function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('uc.position', 'like', "%{$v}%")
                        ->orWhere('cc.position', 'like', "%{$v}%");
                });
            },

            'contact_type' => fn ($q, $v) => $q->where('cc.contact_type', $v),

            'contact_subtype' => function ($q, $v) use ($company_id) {
                $q->whereHas('categories', function ($sub) use ($v, $company_id) {
                    $sub->when($company_id !== 'all', function ($qq) use ($company_id) {
                            $qq->where('categories.company_id', $company_id);
                        })
                        ->where('categories.id', $v);
                });
            },
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        /**
         * 5) Rango de fechas
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
