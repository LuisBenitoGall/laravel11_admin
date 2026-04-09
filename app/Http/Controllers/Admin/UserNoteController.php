<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\User;
use App\Models\UserCompany;
use App\Models\UserNote;

//Requests:
use App\Http\Requests\UserNoteStoreRequest;

//Resource:
use App\Http\Resources\UserNoteResource;

//Traits:
use App\Traits\ConvertDateTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class UserNoteController extends Controller{
    /**
     * 1. Guardar nota.
     * 2. Notas por usuario.
     * 3. Actualizar nota.
     * 4. Actualizar recordatorio.
     * 5. Eliminar nota.
     * 6. Actualizar relevancia.
     * 7. Fijar / desfijar nota.
     * 8. Archivar nota.
     * 9. Próximos recordatorios para propietario.
     */
    
    use ConvertDateTrait;
    use HasUserPermissionsTrait;
    use LocaleTrait;
    
    /**
     * 1. Guardar nota.
     */
    public function store(UserNoteStoreRequest $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        // company_id es opcional: sin empresa en contexto (p. ej. contactos no vinculados) se guarda null

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        $localeCode = $locale[0] ?? app()->getLocale();

        //Tratamiento de fechas:
        $rawRemind = $request->input('remind_at');
        $remind_at = $rawRemind !== ''
            ? ($localeCode !== 'en'
                ? $this->convertDate($rawRemind, false)
                : $rawRemind
            )
            : null;

        // 1. Tags: string "a, b, c" -> ['a', 'b', 'c'] o null
        $rawTags = $request->input('tags', '');
        if (is_array($rawTags)) {
            $tags = array_values(array_filter(array_map('trim', $rawTags)));
        } else {
            $tags = collect(explode(',', (string) $rawTags))
                ->map(fn ($tag) => trim($tag))
                ->filter()
                ->unique()
                ->values()
                ->all();
        }
        if (empty($tags)) {
            $tags = null;
        }

        // 2. Momento en que se fija el recordatorio (solo si hay fecha de recordatorio)
        //$reminder_sent_at = $remind_at ? Carbon::now() : null;

        // 3. Flags booleanos
        $isPinned   = $request->boolean('is_pinned');
        $isArchived = $request->boolean('is_archived');

        //Una nota archiva no puede fijarse:
        if ($isArchived) {
            $isPinned = false;
        }

        // 4. Usuario objeto de la nota (para la redirección final)
        $userId = (int) $request->contact_id;

        $n = new UserNote();
        $n->company_id = $currentCompanyId > 0 ? $currentCompanyId : null;
        $n->owner_id = Auth::id();
        $n->contact_id = $request->contact_id;
        $n->title = $request->title;
        $n->body = $request->body;
        $n->tags = $tags;
        $n->relevance = (int) $request->relevance;
        $n->remind_at = $remind_at;
        $n->reminder_sent_at = null;
        $n->is_pinned = $isPinned;
        $n->is_archived = $isArchived;
        $n->save();

        // Redirección tras guardar: segundo parámetro de users.edit solo si hay contexto de empresa
        $userCompanyParam = $request->input('user_company');
        if ($userCompanyParam !== null && $userCompanyParam !== '') {
            $userCompany = is_numeric($userCompanyParam) ? (int) $userCompanyParam : $userCompanyParam;
        } elseif ($currentCompanyId > 0) {
            $uc = UserCompany::query()
                ->where('user_id', $userId)
                ->where('company_id', $currentCompanyId)
                ->first();
            $userCompany = $uc?->company_id ?? $currentCompanyId;
        } else {
            $userCompany = null;
        }

        if ($userCompany !== null && $userCompany !== '') {
            return redirect()->route('users.edit', [$userId, $userCompany])->with('msg', __('nota_creada_msg'));
        }

        return redirect()->route('users.edit', $userId)->with('msg', __('nota_creada_msg'));
    }

    /**
     * 2. Notas por usuario.
     */
    public function show(Request $request, User $user)
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

        $perPage = (int) $request->input('per_page', 10);
        $search  = trim((string) $request->input('q', ''));

        $query = UserNote::query()
            ->where('contact_id', $user->id)
            ->where(function ($q) use ($currentCompanyId) {
                $q->where('company_id', $currentCompanyId)
                    ->orWhereNull('company_id');
            })
            ->where('is_archived', false)
            ->with('owner')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $like = '%' . $search . '%';

                $q->where('title', 'like', $like)
                  ->orWhere('body', 'like', $like)
                  // tags es JSON; lo buscamos en bruto por ahora
                  ->orWhere('tags', 'like', $like);
            });
        }

        $notes = $query->paginate($perPage);

        return UserNoteResource::collection($notes);
    }

    /**
     * 3. Actualizar nota.
     */
    public function update(Request $request, UserNote $note)
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

        // La nota debe pertenecer a la empresa en contexto (company_id null = nota sin empresa asociada)
        if ($note->company_id !== null && (int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        // Validación mínima (si tienes NoteStoreRequest y quieres reciclarlo, podríamos usarlo)
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'body'  => ['nullable', 'string'],
        ]);

        $note->title = $validated['title'] ?? null;
        $note->body  = $validated['body'] ?? null;
        $note->save();

        return new UserNoteResource($note->fresh('owner'));
    }

    /**
     * 4. Actualizar recordatorio.
     */
    public function updateReminder(Request $request, UserNote $note)
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

        // Seguridad básica: la nota debe pertenecer a la empresa en contexto (o sin empresa)
        if ($note->company_id !== null && (int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        // Validación mínima; ya tratamos formato/locale abajo
        $request->validate([
            'remind_at' => ['nullable', 'string'],
        ]);

        $locale = app()->getLocale();
        $rawRemind = $request->input('remind_at');

        if ($rawRemind === null || $rawRemind === '') {
            $remind_at = null;
        } else {
            $remind_at = $locale[0] !== 'en'
                ? $this->convertDate($rawRemind, false)   // mismo helper que en store
                : $rawRemind;
        }

        $note->remind_at = $remind_at;

        // Si cambiamos el recordatorio, reseteamos el “enviado”
        if (empty($remind_at)) {
            $note->reminder_sent_at = null;
        } else {
            $note->reminder_sent_at = null; // futuro job decidirá cuándo marcarlo
        }

        $note->save();

        // Devolvemos la nota actualizada, formateada igual que en el listado
        return new UserNoteResource($note->fresh('owner'));
    }

    /**
     * 5. Eliminar nota.
     */
    public function destroy(Request $request, UserNote $note)
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

        // Seguridad básica: la nota debe ser de la empresa en contexto (o sin empresa)
        if ($note->company_id !== null && (int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        $note->delete();

        // Desde axios nos basta con un 204/200 sin más florituras
        return response()->json(['success' => true]);
    }

    /**
     * 6. Actualizar relevancia.
     */
    public function updateRelevance(Request $request, UserNote $note)
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

        // La nota debe pertenecer a la empresa en contexto
        if ($note->company_id !== null && (int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        // Validar relevancia (1..5)
        $validated = $request->validate([
            'relevance' => ['required', 'integer', 'between:1,5'],
        ]);

        $note->relevance = (int) $validated['relevance'];
        $note->save();

        // Devolvemos la nota formateada igual que en el listado
        return new UserNoteResource($note->fresh('owner'));
    }

    /**
     * 7. Fijar / desfijar nota.
     */
    public function togglePin(Request $request, UserNote $note)
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

        // Seguridad: nota debe pertenecer a la empresa de la sesión
        if ($note->company_id !== null && (int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        // Regla: una nota archivada no puede estar fijada
        if ($note->is_archived) {
            abort(422, __('nota_archivada_no_fijar') ?: 'No se puede fijar una nota archivada.');
        }

        $note->is_pinned = ! (bool) $note->is_pinned;
        $note->save();

        return new UserNoteResource($note->fresh('owner'));
    }

    /**
     * 8. Archivar nota.
     */
    public function toggleArchive(Request $request, UserNote $note)
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

        // Seguridad: la nota debe pertenecer a la empresa en contexto
        if ($note->company_id !== null && (int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        // Podemos recibir "archive" explícito o hacer toggle si no viene
        $archive = $request->has('archive')
            ? $request->boolean('archive')
            : ! (bool) $note->is_archived;

        if ($archive) {
            $note->is_archived = true;
            $note->is_pinned   = false;   // una archivada no puede estar fijada
            // opcional: podrías también limpiar reminder_sent_at si lo usas
        } else {
            $note->is_archived = false;
            // is_pinned se queda tal cual (por si en un futuro desarchivas desde otra vista)
        }

        $note->save();

        return new UserNoteResource($note->fresh('owner'));
    }

    /**
     * 9. Próximos recordatorios para propietario.
     */
    public function ownerReminders(Request $request)
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

        $ownerId = Auth::id();
        $today   = Carbon::today();

        $notes = UserNote::query()
            ->where(function ($q) use ($currentCompanyId) {
                $q->where('company_id', $currentCompanyId)
                    ->orWhereNull('company_id');
            })
            ->where('owner_id', $ownerId)
            ->where('is_archived', false)
            ->whereNotNull('remind_at')
            ->whereDate('remind_at', '>=', $today)
            ->with([
                'contact:id,name,surname', // ⬅ importante
            ])
            ->orderBy('remind_at', 'asc')    // más próxima arriba
            ->orderByDesc('relevance')       // a igual día, más relevantes primero
            ->limit(50)
            ->get();

        return UserNoteResource::collection($notes);
    }
}
