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
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Concerns:
use App\Concerns\HasContactTypes;
use App\Concerns\HasSalutation;

//Jobs:
use App\Jobs\SyncMarketingListToBrevo;

//Models:
use App\Models\Company;
use App\Models\Country;
use App\Models\CrmAccount;
use App\Models\Currency;
use App\Models\MarketingList;
use App\Models\MarketingListUser;
use App\Models\User;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\MarketingListFilterRequest;
use App\Http\Requests\MarketingListStoreRequest;
use App\Http\Requests\MarketingListUpdateRequest;

//Resources:
use App\Http\Resources\MarketingListResource;

//Services:
use App\Services\Brevo\BrevoMarketingService;
use App\Services\SlugService;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class MarketingListController extends Controller
{
    /**
     * 1. Listado de listas de marketing por empresa.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva lista.
     * 3. Guardar nueva lista.
     * 3.1. Guardar nueva lista desde Crm Contacts.
     * 4. Mostrar lista.
     * 5. Editar lista.
     * 5.1. Filtro de listado de miembros.
     * 5.2. Data para exportación de miembros.
     * 6. Actualizar lista.
     * 7. Eliminar lista.
     * 8. Actualizar estado.
     * 9. Mapeo de miembros.
     * 10. Exportar lista a Brevo.
     */

    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'marketing';
    private $option = 'marketing_listas';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'marketing-lists.create',
                'marketing-lists.destroy',
                'marketing-lists.edit',
                'marketing-lists.index',
                'marketing-lists.search',
                'marketing-lists.show',
                'marketing-lists.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de listas de marketing por empresa.
     */
    public function index(MarketingListFilterRequest $request){
        //Actualizando nº de miembros por lista:
        $list_members = MarketingList::select('id', 'members_count')
        ->where('members_count', '0')
        ->where('status', 1)
        ->get();

        if($list_members->count()){
            foreach($list_members as $lm){
                $membersCount = MarketingListUser::countForList($lm->id);
                
                $lm->members_count = $membersCount;
                $lm->save();   
            }
        }

        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $lists = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);
        
        return Inertia::render('Admin/MarketingList/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'marketing-lists',
            "lists" => MarketingListResource::collection($lists),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblMarketingLists'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(MarketingListFilterRequest $request){
        $cacheKey = 'filtered_lists_' . md5(json_encode($request->all()));

        $lists = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'lists' => MarketingListResource::collection($lists)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(MarketingListFilterRequest $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if ($currentCompanyId <= 0) {
            $url = route('companies.refresh-session');

            // si quieres ser fino, guarda a dónde quería ir originalmente
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if ($request->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        // Eager load del autor, así el Resource no hace N+1
        $query = MarketingList::query()
            ->with('createdBy')
            ->where('company_id', $currentCompanyId);

        /*
         * Normalizamos el filtro de autor: si llegan author o created_by_name,
         * los reutilizamos como created_by.
         */
        if (!$request->filled('created_by')) {
            $altAuthor = $request->input('author')
                ?? $request->input('created_by_name');

            if (is_string($altAuthor) && trim($altAuthor) !== '') {
                $request->merge(['created_by' => $altAuthor]);
            }
        }

        // Closure reutilizable para filtrar por nombre del autor
        $authorFilterCallback = function ($q, $v) {
            $v = trim((string) $v);
            if ($v === '') {
                return;
            }

            $q->whereHas('createdBy', function ($sub) use ($v) {
                $sub->where(function ($qq) use ($v) {
                    $qq->where('users.name', 'like', "%{$v}%")
                       ->orWhere('users.surname', 'like', "%{$v}%")
                       ->orWhereRaw(
                           "CONCAT(TRIM(COALESCE(users.name, '')), ' ', TRIM(COALESCE(users.surname, ''))) LIKE ?",
                           ["%{$v}%"]
                       );
                });
            });
        };

        // Filtros dinámicos
        $filters = [
            'name'            => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }
                $q->where('name', 'like', "%{$v}%");
            },

            // Aceptamos varias claves posibles desde el front
            'created_by'      => $authorFilterCallback,
            'created_by_name' => $authorFilterCallback,
            'author'          => $authorFilterCallback,
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // Filtros por rangos de fechas dinámicos
        $dateFilters = [
            'created_at' => ['date_from', 'date_to'],
        ];

        foreach ($dateFilters as $column => [$fromKey, $toKey]) {
            $from = $request->input($fromKey);
            $to   = $request->input($toKey);

            if ($from && $to) {
                $query->whereBetween($column, ["{$from} 00:00:00", "{$to} 23:59:59"]);
            } elseif ($from) {
                $query->where($column, '>=', "{$from} 00:00:00");
            } elseif ($to) {
                $query->where($column, '<=', "{$to} 23:59:59");
            }
        }

        /*
         * Ordenación
         * - Permitimos name, members_count y created_at.
         * - Si en el front decides ordenar por autor en algún momento,
         *   ya haremos un join específico; de momento no lo fuerzo.
         */
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');

        $allowedSortFields = ['name', 'members_count', 'created_at'];

        if (!in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nueva campaña.
     */
    public function create(){
        return Inertia::render('Admin/MarketingList/Create', [
            "title" => __($this->option),
            "subtitle" => __('lista_nueva'),
            'module' => $this->module,
            "slug" => 'marketing-lists',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva lista.
     */
    public function store(MarketingListStoreRequest $request, SlugService $slugService){
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

        $normalizedName = trim($request->name);

        // ✅ Regla de negocio: mismo nombre + misma empresa → NO permitido
        $existsByName = MarketingList::where('company_id', $currentCompanyId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($normalizedName)])
            ->exists();

        if ($existsByName) {
            return back()
                ->withInput()
                ->withErrors([
                    'name' => __('lista_nombre_duplicado'), 
                    // crea esta key en lang: "Ya existe una lista con ese nombre en esta empresa."
                ]);
        }

        $slug = $slugService->generate(MarketingList::class, $normalizedName, [
            'company_id' => $currentCompanyId,
        ]);

        $status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN)? 1:0;

        $list = new MarketingList();
        $list->owner_id = Auth::id();
        $list->company_id = $currentCompanyId;
        $list->name = $request->name;
        $list->slug = $slug;
        $list->observations = $request->observations;
        $list->status = $status;
        $list->is_dynamic = 1;
        $list->created_by = Auth::id();
        $list->updated_by = Auth::id();
        $list->save();

        return redirect()->route('marketing-lists.edit', $list->id)
            ->with('msg', __('lista_creada_msg'));
    }

    /**
     * 3.1. Guardar nueva lista desde Crm Contacts.
     */
    public function storeFromContacts(Request $request, SlugService $slugService)
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

        $data = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'observations'     => ['nullable', 'string'],
            'redirect_filters' => ['nullable', 'array'],   // 👈 aquí entran los filtros del listado
        ]);

        $normalizedName = trim($data['name']);

        // Regla: mismo nombre + misma empresa → no permitido
        $existsByName = MarketingList::where('company_id', $currentCompanyId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($normalizedName)])
            ->exists();

        if ($existsByName) {
            return back()
                ->withInput()
                ->withErrors([
                    'name' => __('lista_nombre_duplicado'),
                ]);
        }

        $slug = $slugService->generate(MarketingList::class, $normalizedName, [
            'company_id' => $currentCompanyId,
        ]);

        $userId = Auth::id();

        $list = new MarketingList();
        $list->owner_id      = $userId;
        $list->company_id    = $currentCompanyId;
        $list->name          = $data['name'];
        $list->slug          = $slug;
        $list->observations  = $data['observations'] ?? null;
        $list->status        = 1;
        $list->is_dynamic    = 1;
        $list->members_count = 0;
        $list->created_by    = $userId;
        $list->updated_by    = $userId;
        $list->save();

        // Filtros del listado de contactos: JSON → array; solo claves de primer nivel string
        // (evita índices numéricos que Laravel interpreta mal en route()).
        $redirectFilters = $this->sanitizeRedirectFiltersForQuery($data['redirect_filters'] ?? []);

        $merged = array_merge($redirectFilters, [
            'marketing_list_id'    => $list->id,
            'build_marketing_list' => 1,
        ]);

        return redirect()
            ->route('crm-contacts.index', $merged)
            ->with('msg', __('lista_creada_msg'));
    }

    /**
     * Normaliza filtros enviados desde el front (JSON) para el query del redirect.
     * Solo se conservan entradas con clave string en el primer nivel; el resto se ignora.
     * Las claves anidadas (p. ej. adhoc) se mantienen tal cual.
     *
     * @param  mixed  $filters
     * @return array<string, mixed>
     */
    private function sanitizeRedirectFiltersForQuery(mixed $filters): array
    {
        if (! is_array($filters)) {
            return [];
        }

        $encoded = json_encode($filters);
        if ($encoded === false || $encoded === '') {
            return [];
        }

        $decoded = json_decode($encoded, true);
        if (! is_array($decoded)) {
            return [];
        }

        $out = [];
        foreach ($decoded as $key => $value) {
            if (! is_string($key)) {
                continue;
            }
            $out[$key] = $value;
        }

        return $out;
    }

    /**
     * 4. Mostrar lista.
     */
    public function show(Request $request, MarketingList $list){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        //Formato de fecha:
        $dateFormat = $locale[4] ?? 'd/m/Y';

        $list->formatted_created_at = Carbon::parse($list->created_at)->format($locale[4].' H:i:s');

        $list->last_used = $list->last_used_at
        ? $list->last_used_at->format($dateFormat)
        : null;

        $list->owner;

        if ($request->expectsJson()) {
            return response()->json([
                'data' => $list,
            ]);
        }

        // Si algún día quieres una vista "show" completa de página
        return Inertia::render('Admin/MarketingList/Show', [
            'list' => $list
        ]);
    }

    /**
     * 5. Editar lista.
     */
    public function edit(Request $request, MarketingList $list, $tab = false)
    {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        // Formateo de datos:
        $list->formatted_created_at = Carbon::parse($list->created_at)->format($locale[4] . ' H:i:s');
        $list->formatted_updated_at = Carbon::parse($list->updated_at)->format($locale[4] . ' H:i:s');

        $list->created_by_name = optional($list->createdBy)->full_name ?? false;
        $list->updated_by_name = optional($list->updatedBy)->full_name ?? false;

        // Paginación
        $perPage = (int) $request->input('per_page', 10);

        // Query de miembros con filtros/orden
        $membersQuery = $this->membersDataQuery($request, $list);

        // Paginator para Inertia
        $members = $membersQuery
            ->paginate($perPage)
            ->withQueryString();

        // Filas para la tabla (misma forma que en el tab)
        $table = $this->mapUsersForTable($members->getCollection(), $locale);

        // Listas de la misma empresa, activas, excluyendo la actual
        $cloneSourceLists = MarketingList::query()
            ->where('company_id', $list->company_id)
            ->where('status', 1)
            ->where('id', '<>', $list->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/MarketingList/Edit', [
            'title'            => __($this->option),
            'subtitle'         => __('lista_editar'),
            'module'           => $this->module,
            'slug'             => 'marketing-lists',
            'availableLocales' => LocaleTrait::availableLocales(),
            'list'             => $list,
            'tab'              => $tab,

            // paginator completo
            'users'            => $members,

            // filas ya transformadas para la tabla
            'rows'             => $table,

            'cloneSourceLists' => $cloneSourceLists,
            'msg'              => session('msg'),
            'alert'            => session('alert'),
            'permissions'      => $this->permissions,

            // contexto de filtros / paginación
            'queryParams'      => $request->all(),
        ]);
    }

    /**
     * 5.1. Filtro de listado de miembros.
     */
    private function membersDataQuery(Request $request, MarketingList $list): Builder
    {
        $companyId = (int) $list->company_id;

        $nameFilter     = trim((string) $request->input('name', ''));
        $emailFilter    = trim((string) $request->input('email', ''));
        $phonesFilter   = trim((string) $request->input('phones', ''));
        $positionFilter = trim((string) $request->input('position', ''));

        $dateFrom = $request->input('date_from');
        $dateTo   = $request->input('date_to');

        // Orden
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = strtoupper($request->input('sort_direction', 'ASC'));

        if (! in_array($sortDirection, ['ASC', 'DESC'], true)) {
            $sortDirection = 'ASC';
        }

        $allowedSortFields = ['name', 'email', 'created_at'];
        if (! in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'name';
        }

        $query = User::select(
                'users.id',
                'users.name',
                'users.surname',
                'users.email',
                // aquí viene del CRM, no de users:
                DB::raw('MIN(cc.position) AS position'),
                'marketing_list_users.id AS mlu_id',
                'marketing_list_users.observations',
                'marketing_list_users.status AS mlu_status',
                'marketing_list_users.created_at',
                'user_companies.company_id'
            )
            ->join('marketing_list_users', 'users.id', '=', 'marketing_list_users.user_id')
            ->leftJoin('user_companies', 'users.id', '=', 'user_companies.user_id')
            ->leftJoin('crm_contacts AS cc', function ($j) use ($companyId) {
                $j->on('cc.user_id', '=', 'users.id')
                  ->where('cc.company_id', '=', $companyId)
                  ->whereNull('cc.deleted_at');
            })
            ->where('marketing_list_users.marketing_list_id', $list->id)
            ->where('users.status', 1)
            ->with(['phones', 'avatar'])
            ->groupBy(
                'users.id',
                'users.name',
                'users.surname',
                'users.email',
                'marketing_list_users.id',
                'marketing_list_users.observations',
                'marketing_list_users.status',
                'marketing_list_users.created_at',
                'user_companies.company_id'
            );

        // Filtro por nombre (full_name)
        if ($nameFilter !== '') {
            $query->whereRaw("
                CONCAT(
                    TRIM(COALESCE(users.name, '')),
                    ' ',
                    TRIM(COALESCE(users.surname, ''))
                ) LIKE ?
            ", ["%{$nameFilter}%"]);
        }

        // Filtro por email
        if ($emailFilter !== '') {
            $query->where('users.email', 'like', "%{$emailFilter}%");
        }

        // Filtro por cargo (posición del crm_contact)
        if ($positionFilter !== '') {
            $query->where('cc.position', 'like', "%{$positionFilter}%");
        }

        // Filtro por teléfono (relación phones)
        if ($phonesFilter !== '') {
            $query->whereHas('phones', function ($q) use ($phonesFilter) {
                $q->where('e164', 'like', "%{$phonesFilter}%");
            });
        }

        // Rango de fechas: alta en la lista
        if ($dateFrom && $dateTo) {
            $query->whereBetween('marketing_list_users.created_at', [
                "{$dateFrom} 00:00:00",
                "{$dateTo} 23:59:59",
            ]);
        } elseif ($dateFrom) {
            $query->where('marketing_list_users.created_at', '>=', "{$dateFrom} 00:00:00");
        } elseif ($dateTo) {
            $query->where('marketing_list_users.created_at', '<=', "{$dateTo} 23:59:59");
        }

        // Orden
        switch ($sortField) {
            case 'email':
                $query->orderBy('users.email', $sortDirection);
                break;

            case 'created_at':
                $query->orderBy('marketing_list_users.created_at', $sortDirection);
                break;

            case 'name':
            default:
                $query->orderBy('users.name', $sortDirection);
                break;
        }

        return $query;
    }

    /**
     * 5.2. Data para exportación de miembros.
     */
    public function membersFilteredData(Request $request, MarketingList $list)
    {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        // misma query que usa la vista, pero sin paginación
        $query = $this->membersDataQuery($request, $list);

        $users = $query->get();

        // Reutilizamos el mismo mapper de filas de la tabla
        $rows = $this->mapUsersForTable($users, $locale);

        // OJO: la key 'users' está elegida adrede para que
        // useTableManagement (entityName = 'users') detecte el array
        return response()->json([
            'users' => $rows,
        ]);
    }

    /**
     * 6. Actualizar lista.
     */
    public function update(MarketingListUpdateRequest $request, MarketingList $list, SlugService $slugService){
        $slug = $slugService->generate(MarketingList::class, $request->name, [
            'company_id' => $list->company_id,
            'ignore_id'  => $list->id,
        ]);

        $list->name = $request->name;
        $list->slug = $slug;
        $list->observations = $request->observations;
        $list->status = $request->boolean('status') ? 1 : 0;
        $list->updated_by = Auth::id();
        $list->save();

        return redirect()->route('marketing-lists.edit', $list->id)
            ->with('msg', __('lista_actualizada_msg'));
    }

    /**
     * 7. Eliminar lista.
     */
    public function destroy(MarketingList $list){
        $list_id = $list->id;
    
        $list->delete();

        return redirect()->route('marketing-lists.index')->with('msg', __('lista_eliminada'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $list = MarketingList::find($request->id);

        if(!$list){
            return response()->json(['error' => __('lista_no_encontrada')], 404);
        }

        $list->status = !$list->status;
        $list->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $list->status
        ]);
    }

    /**
     * 9. Mapeo de miembros.
     */
    private function mapUsersForTable(Collection $users, array $locale): Collection
    {
        return $users->map(function ($u) use ($locale) {
            $primary = $u->phones->firstWhere('is_primary', true) ?: $u->phones->first();
            $salutation = $u->salutation ? HasSalutation::salutationAbbrOf($u->salutation) : '';

            return [
                'id'            => $u->id,
                'mlu_id'        => $u->mlu_id,
                'name'          => trim($salutation . ' ' . ucwords($u->name) . ' ' . ucwords($u->surname)),
                'position'      => $u->position,
                'created_at'    => Carbon::parse($u->created_at)->format($locale[4]),
                'email'         => $u->email,
                'avatar'        => $u->avatar && $u->avatar->image
                                    ? \Storage::url('users/' . $u->avatar->image)
                                    : null,
                'phone_primary' => $primary?->e164,
                'whatsapp'      => (bool) optional($primary)->is_whatsapp,
                'phones_count'  => $u->phones->count(),
                'phones'        => $u->phones->map(fn($p) => [
                    'e164'        => $p->e164,
                    'type'        => $p->type,
                    'label'       => $p->label,
                    'is_primary'  => $p->is_primary,
                    'is_whatsapp' => $p->is_whatsapp,
                ])->values(),
            ];
        });
    }

    /**
     * 10. Exportar lista a Brevo.
     */
    public function exportToBrevo_DEPRECATED(MarketingList $list, BrevoMarketingService $brevo)
    {
        // Seguridad mínima: misma empresa que la de sesión, etc.
        $ctx = app(\App\Support\CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if ($currentCompanyId <= 0 || $list->company_id !== $currentCompanyId) {
            abort(403, 'Empresa no válida para esta lista.');
        }

        try {
            // 1) Asegurar que la lista existe en Brevo
            $brevo->ensureRemoteList($list);

            // 2) Sincronizar miembros
            $brevo->syncListMembers($list);

            return back()->with('msg', __('lista_exportada_a_brevo_ok'));
        } catch (\Throwable $e) {
            \Log::error('Error exporting list to Brevo', [
                'list_id' => $list->id,
                'error'   => $e->getMessage(),
            ]);

            return back()->with('alert', __('error_exportando_lista_brevo').': '.$e->getMessage());
        }
    }

    public function exportToBrevo(MarketingList $list/*, BrevoMarketingService $brevo*/)
    {
        $ctx = app(\App\Support\CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if ($currentCompanyId <= 0 || $list->company_id !== $currentCompanyId) {
            abort(403, 'Empresa no válida para esta lista.');
        }

        // Disparamos la sincronización en segundo plano
        SyncMarketingListToBrevo::dispatch($list->id, Auth::id());

        // Respondemos rápido al usuario
        return back()->with('msg', __('lista_export_brevo_en_proceso'));
    }

}
