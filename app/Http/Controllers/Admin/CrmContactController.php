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

    public function index_(Request $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if ($currentCompanyId <= 0) {
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        // /admin/crm-leads → segment(2) = 'crm-leads'
        $leads = $request->segment(2) === 'crm-leads';

        $perPage = (int) $request->input(
            'per_page',
            (int) config('constants.RECORDS_PER_PAGE_DEFAULT_', 10)
        );

        // que dataQuery pueda leerlo desde $request->input('leads')
        $request->merge(['leads' => $leads]);


        // Builder base (NO se ejecuta todavía)
        $builder = $this->dataQuery($request);

        // Ejecutamos paginación y además transformamos cada fila con through()
        $contacts = $builder
            ->paginate($perPage)
            ->onEachSide(1)
            ->through(function (User $user) {
                // contact_type ya viene como código en la columna agregada
                $contactTypeCode  = $user->contact_type ?? null;
                $contactTypeLabel = $contactTypeCode
                    ? HasContactTypes::typesOf($contactTypeCode)
                    : null;

                // phones viene eager loaded
                $phones = $user->relationLoaded('phones')
                    ? $user->phones->map(fn ($p) => [
                        'e164'        => $p->e164,
                        'type'        => $p->type,
                        'label'       => $p->label,
                        'is_primary'  => $p->is_primary,
                        'is_whatsapp' => $p->is_whatsapp,
                    ])->values()
                    : collect();

                // subtipos: ya vienen resueltos en el Resource antiguo
                // como aún no lo calculamos aquí, de momento lo dejamos en null
                // (si luego hace falta, lo añadimos de forma controlada)
                return [
                    'id'              => $user->id,
                    'name'            => trim($user->full_name ?? ($user->name . ' ' . $user->surname)),
                    'surname'         => $user->surname,
                    'nickname'        => $user->nickname,
                    'email'           => $user->email,
                    'sex'             => $user->sex ? strtolower(trim($user->sex))[0] : null,
                    'birthday'        => $user->birthday ? $user->birthday->format('Y-m-d') : null,
                    'nif'             => $user->nif,
                    'signature'       => $user->signature,
                    'isAdmin'         => (bool) $user->isAdmin,
                    'avatar'          => $user->avatar && $user->avatar->image
                        ? \Storage::url('users/' . $user->avatar->image)
                        : null,
                    'phones_count'    => $phones->count(),
                    'phones'          => $phones,
                    'position'        => $user->position ?? null,
                    'department'      => $user->department ?? null,
                    'contact_type'    => $contactTypeLabel,   // lo que ve la tabla
                    'contact_type_raw'=> $contactTypeCode,    // por si quieres filtrar por código en front
                    'contact_subtype' => null,                // luego afinamos si hace falta
                    // de momento dejamos companies vacío para limitar peso / complejidad
                    'companies'       => [],
                    'edit_company_id'     => $user->getAttribute('edit_company_id'),
                    'edit_crm_account_id' => $user->getAttribute('edit_crm_account_id'),
                    'status'              => $user->status,
                    'deleted_at'          => $user->deleted_at,
                    'created_at'          => optional($user->created_at)->format('Y-m-d H:i:s'),
                    'updated_at'          => optional($user->updated_at)->format('Y-m-d H:i:s'),
                ];
            });

        $t1 = microtime(true);
        Log::info('CRM_CONTACTS index: after paginate+through()', [
            't' => $t1 - $t0,
            'count' => $contacts->count(),
        ]);

        $salutations          = HasSalutation::comboOptions();
        $contact_types        = HasContactTypes::typesMap();
        $contact_types_combo  = HasContactTypes::comboOptions();

        $contact_subtypes = Category::where('company_id', $currentCompanyId)
            ->where('module', 'users')
            ->where('status', 1)
            ->where('depth', '0')
            ->orderBy('name', 'ASC')
            ->get();

        $slug = $leads ? 'crm-leads' : 'crm-contacts';

        return Inertia::render('Admin/CrmContact/Index', [
            "title"               => __($this->option),
            "subtitle"            => $leads ? __('clientes_potenciales') : __('contactos'),
            "module"              => $this->module,
            "slug"                => $slug,
            //"contacts"            => UserResource::collection($contacts),  
            "contacts"          => [],
            "salutations"         => $salutations,
            "contact_types"       => $contact_types,
            "contact_types_combo" => $contact_types_combo,
            "contact_subtypes"    => $contact_subtypes,
            "leads"               => $leads,
            //"queryParams"         => request()->query() ?: null,
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
     *
     * 09/12/2025: se ha modificado la consulta para obtener sólo CRM Contactos, omitiendo los relacionados con Customer Providers. Considerar su inclusión en un futuro.
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
