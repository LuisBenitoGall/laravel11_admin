<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Support\CompanyContext;
use Carbon\Carbon;

// Models:
use App\Models\Company;
use App\Models\CompanyNote;

// Requests:
use App\Http\Requests\CompanyNoteStoreRequest;

// Resource:
use App\Http\Resources\CompanyNoteResource;

// Traits:
use App\Traits\ConvertDateTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CompanyNoteController extends Controller{
    /**
     * 1. Guardar nota.
     * 2. Notas por empresa.
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
     *
     * Notas que pertenecen a la empresa en contexto (company_id)
     * y tratan sobre otra empresa (subject_company_id).
     */
    public function store(CompanyNoteStoreRequest $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        // Política: quien pueda editar empresas puede crear notas
        $this->authorize('create', CompanyNote::class);

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        // Tratamiento de fechas (igual que en UserNote)
        $rawRemind = $request->input('remind_at');
        $remind_at = $rawRemind !== ''
            ? ($locale[0] !== 'en'
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

        // 2. Flags booleanos
        $isPinned   = $request->boolean('is_pinned');
        $isArchived = $request->boolean('is_archived');

        // Una nota archivada no puede fijarse:
        if ($isArchived) {
            $isPinned = false;
        }

        // 3. Empresa objeto de la nota
        $subjectCompanyId = (int) $request->subject_company_id;

        $n = new CompanyNote();
        $n->company_id         = $currentCompanyId;
        $n->owner_id           = Auth::id();
        $n->subject_company_id = $subjectCompanyId;
        $n->title              = $request->title;
        $n->body               = $request->body;
        $n->tags               = $tags;
        $n->relevance          = (int) $request->relevance;
        $n->remind_at          = $remind_at;
        $n->reminder_sent_at   = null;
        $n->is_pinned          = $isPinned;
        $n->is_archived        = $isArchived;
        $n->save();

        // Redirección básica: de vuelta a la edición de la empresa
        if($request->crm_account_id){
            return redirect()
            ->route('crm-accounts.edit', [$request->crm_account_id, 'notes'])
            ->with('msg', __('nota_creada_msg'));
        }else{
            return redirect()
            ->route('companies.edit', [$subjectCompanyId, 'notes'])
            ->with('msg', __('nota_creada_msg'));    
        }
    }

    /**
     * 2. Notas por empresa (subject_company).
     *
     * Usado por CompanyNotes.jsx:
     * GET route('company-notes.show', companyId)
     */
    public function show(Request $request, Company $company){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        // Política: companies.show o companies.edit
        $this->authorize('viewAny', CompanyNote::class);

        $perPage = (int) $request->input('per_page', 10);
        $search  = trim((string) $request->input('q', ''));

        $query = CompanyNote::forCompany($currentCompanyId)
            ->where('subject_company_id', $company->id)
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

        return CompanyNoteResource::collection($notes);
    }

    /**
     * 3. Actualizar nota (título/cuerpo y poco más).
     *
     * PUT route('company-notes.update', note)
     */
    public function update(Request $request, CompanyNote $note){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        $this->authorize('update', $note);

        // Validación mínima
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'body'  => ['nullable', 'string'],
        ]);

        $note->title = $validated['title'] ?? null;
        $note->body  = $validated['body'] ?? null;
        $note->save();

        return new CompanyNoteResource($note->fresh('owner'));
    }

    /**
     * 4. Actualizar recordatorio.
     *
     * PUT route('company-notes.update-reminder', note)
     */
    public function updateReminder(Request $request, CompanyNote $note){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        // Seguridad básica: la nota debe pertenecer a la empresa en contexto
        if ((int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        $this->authorize('updateReminder', $note);

        $request->validate([
            'remind_at' => ['nullable', 'string'],
        ]);

        $locale = app()->getLocale();
        $rawRemind = $request->input('remind_at');

        if ($rawRemind === null || $rawRemind === '') {
            $remind_at = null;
        } else {
            // copiamos la misma lógica que en UserNoteController
            $remind_at = $locale[0] !== 'en'
                ? $this->convertDate($rawRemind, false)
                : $rawRemind;
        }

        $note->remind_at = $remind_at;

        // Si cambiamos el recordatorio, reseteamos el “enviado”
        $note->reminder_sent_at = null;

        $note->save();

        return new CompanyNoteResource($note->fresh('owner'));
    }

    /**
     * 5. Eliminar nota.
     *
     * DELETE route('company-notes.destroy', note)
     */
    public function destroy(Request $request, CompanyNote $note){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        if ((int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        $this->authorize('delete', $note);

        $note->delete();

        return response()->json(['success' => true]);
    }

    /**
     * 6. Actualizar relevancia.
     *
     * PUT route('company-notes.update-relevance', note)
     */
    public function updateRelevance(Request $request, CompanyNote $note){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        if ((int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        $this->authorize('updateRelevance', $note);

        $validated = $request->validate([
            'relevance' => ['required', 'integer', 'between:1,5'],
        ]);

        $note->relevance = (int) $validated['relevance'];
        $note->save();

        return new CompanyNoteResource($note->fresh('owner'));
    }

    /**
     * 7. Fijar / desfijar nota.
     *
     * PUT route('company-notes.toggle-pin', note)
     */
    public function togglePin(Request $request, CompanyNote $note){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        if ((int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        $this->authorize('togglePin', $note);

        // Regla: una nota archivada no puede estar fijada
        if ($note->is_archived) {
            abort(422, __('nota_archivada_no_fijar') ?: 'No se puede fijar una nota archivada.');
        }

        $note->is_pinned = ! (bool) $note->is_pinned;
        $note->save();

        return new CompanyNoteResource($note->fresh('owner'));
    }

    /**
     * 8. Archivar nota.
     *
     * PUT route('company-notes.toggle-archive', note)
     *      { archive: true|false } o toggle si no se envía.
     */
    public function toggleArchive(Request $request, CompanyNote $note){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        if ((int) $note->company_id !== $currentCompanyId) {
            abort(403, __('accion_no_autorizada'));
        }

        $this->authorize('toggleArchive', $note);

        $archive = $request->has('archive')
            ? $request->boolean('archive')
            : ! (bool) $note->is_archived;

        if ($archive) {
            $note->is_archived = true;
            $note->is_pinned   = false;   // una archivada no puede estar fijada
        } else {
            $note->is_archived = false;
        }

        $note->save();

        return new CompanyNoteResource($note->fresh('owner'));
    }

    /**
     * 9. Próximos recordatorios para propietario.
     *
     * GET route('company-notes.owner-reminders')
     */
    public function ownerReminders(Request $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        $this->authorize('viewAny', CompanyNote::class);

        $ownerId = Auth::id();
        $today   = Carbon::today();

        $notes = CompanyNote::query()
            ->where('company_id', $currentCompanyId)
            ->where('owner_id', $ownerId)
            ->where('is_archived', false)
            ->whereNotNull('remind_at')
            ->with([
                'subjectCompany:id,name', // ajústalo a los campos reales de Company
            ])
            ->whereDate('remind_at', '>=', $today)
            ->orderBy('remind_at', 'asc')
            ->orderByDesc('relevance')
            ->limit(50)
            ->get();

        return CompanyNoteResource::collection($notes);
    }
}
