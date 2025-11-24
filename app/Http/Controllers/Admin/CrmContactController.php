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
     * 
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'crm';
    private $option = 'contactos_crm';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'crm-accounts.create',
                'crm-accounts.destroy',
                'crm-accounts.edit',
                'crm-accounts.index',
                'crm-accounts.search',
                'crm-accounts.show',
                'crm-accounts.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de contactos.
     */
    public function index(Request $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $contacts = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/CrmContact/Index', [
            "title" => __($this->option),
            "subtitle" => __('contactos'),
            "module" => $this->module,
            "slug" => 'crm-contacts',
            "contacts" => UserResource::collection($contacts),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblContacts'] 
            )
        ]);
    }

    /**
     * 1.1. Contactos para exportación.
     */
    public function filteredData(UserFilterRequest $request)
    {
        $company_id = $request->input('company_id', session('currentCompany'));

        $cacheKey = 'filtered_contacts_' . $company_id . '_' . md5(json_encode($request->all()));

        // Aseguramos que company_id esté en el request
        $request->merge(['company_id' => $company_id]);

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
        $company_id = (int) $request->input('company_id', session('currentCompany'));

        // 1) Empresas relacionadas vía customer_providers (clientes/proveedores)
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

        // 2) Users vinculados a empresas distintas de la de sesión (clientes/proveedores)
        $userIdsFromCompanies = DB::table('user_companies')
            ->where('company_id', '!=', $company_id)
            ->when(!empty($relatedCompanyIds), function ($q) use ($relatedCompanyIds) {
                $q->orWhereIn('company_id', $relatedCompanyIds);
            })
            ->pluck('user_id');

        // 3) Users vinculados por crm_contacts a la empresa en sesión
        $userIdsFromCrm = DB::table('crm_contacts')
            ->where('company_id', $company_id)
            ->pluck('user_id');

        // 4) Unión
        $userIds = $userIdsFromCompanies
            ->merge($userIdsFromCrm)
            ->unique()
            ->filter()
            ->values();

        if ($userIds->isEmpty()) {
            return User::query()->whereRaw('1 = 0');
        }

        $query = User::query()
        ->from('users')
        // empresa distinta de la de sesión (para position)
        ->leftJoin('user_companies as uc', function ($j) use ($company_id) {
            $j->on('uc.user_id', '=', 'users.id')
              ->where('uc.company_id', '!=', $company_id);
        })
        // cuenta CRM vinculada (para edit_crm_account_id)
        ->leftJoin('crm_accounts as ca', function ($j) use ($company_id) {
            $j->on('ca.linked_company_id', '=', 'uc.company_id')
              ->where('ca.company_id', '=', $company_id);
        })
        // contactos CRM para la empresa en sesión (para contact_type)
        ->leftJoin('crm_contacts as cc', function ($j) use ($company_id) {
            $j->on('cc.user_id', '=', 'users.id')
              ->where('cc.company_id', '=', $company_id);
        })
        ->with(['avatar', 'phones'])
        ->whereIn('users.id', $userIds)
        ->select([
            // SOLO las columnas de users que necesitas en el listado
            'users.id',
            'users.name',
            'users.surname',
            'users.email',
            'users.status',

            // Campos agregados
            DB::raw('MIN(uc.company_id)   as edit_company_id'),
            DB::raw('MIN(ca.id)           as edit_crm_account_id'),
            DB::raw('MIN(uc.position)     as position'),
            DB::raw('MAX(cc.contact_type) as contact_type'),
        ])
        ->groupBy(
            'users.id',
            'users.name',
            'users.surname',
            'users.email',
            'users.status',
        );

        // 6) Filtros (lo de abajo lo puedes dejar igual)
        $filters = [
            'name' => function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('users.name', 'like', "%$v%")
                        ->orWhere('users.surname', 'like', "%$v%");
                });
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
            'position' => fn ($q, $v) => $q->where('uc.position', 'like', "%{$v}%"),
            'contact_type' => fn ($q, $v) => $q->where('cc.contact_type', 'like', "%{$v}%"),
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // 7) Rango de fechas (igual)
        $from = $request->input('date_from');
        $to   = $request->input('date_to');

        if ($from && $to) {
            $query->whereBetween('users.created_at', ["$from 00:00:00", "$to 23:59:59"]);
        } elseif ($from) {
            $query->where('users.created_at', '>=', "$from 00:00:00");
        } elseif ($to) {
            $query->where('users.created_at', '<=', "$to 23:59:59");
        }

        // 8) Orden (todos los campos permitidos están en el SELECT y en el GROUP BY)
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'surname', 'email'];

        if (!in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'name';
        }

        return $query->orderBy("users.$sortField", $sortDirection);
    }
}
