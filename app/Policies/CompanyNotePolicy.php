<?php

namespace App\Policies;

use App\Models\CompanyNote;
use App\Models\User;
use App\Support\CompanyContext;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompanyNotePolicy{
    use HandlesAuthorization;

    /**
     * Ver el listado de notas (index/search).
     * Requiere poder ver la empresa (companies.show) o editarla (companies.edit).
     */
    public function viewAny(User $user){
        if (!$this->hasCompanyContext()) {
            return false;
        }

        return $this->canShowCompanies($user) || $this->canEditCompanies($user);
    }

    /**
     * Ver una nota concreta.
     */
    public function view(User $user, CompanyNote $note){
        if (!$this->sameCompany($note)) {
            return false;
        }

        return $this->canShowCompanies($user) || $this->canEditCompanies($user);
    }

    /**
     * Crear una nota.
     * Requiere companies.edit.
     */
    public function create(User $user){
        if (!$this->hasCompanyContext()) {
            return false;
        }

        return $this->canEditCompanies($user);
    }

    /**
     * Actualizar una nota.
     * Requiere companies.edit.
     */
    public function update(User $user, CompanyNote $note){
        if (!$this->sameCompany($note)) {
            return false;
        }

        return $this->canEditCompanies($user);
    }

    /**
     * Eliminar (soft delete) una nota.
     * Requiere companies.edit.
     */
    public function delete(User $user, CompanyNote $note){
        if (!$this->sameCompany($note)) {
            return false;
        }

        return $this->canEditCompanies($user);
    }

    /**
     * Restaurar una nota eliminada.
     * Requiere companies.edit.
     */
    public function restore(User $user, CompanyNote $note){
        if (!$this->sameCompany($note)) {
            return false;
        }

        return $this->canEditCompanies($user);
    }

    /**
     * Borrado definitivo.
     * Si no lo usas, igual te da, pero lo alineo con edit.
     */
    public function forceDelete(User $user, CompanyNote $note){
        if (!$this->sameCompany($note)) {
            return false;
        }

        return $this->canEditCompanies($user);
    }

    /**
     * Marcar / desmarcar como fijada.
     */
    public function togglePin(User $user, CompanyNote $note){
        return $this->update($user, $note);
    }

    /**
     * Archivar / desarchivar.
     */
    public function toggleArchive(User $user, CompanyNote $note){
        return $this->update($user, $note);
    }

    /**
     * Actualizar recordatorio.
     */
    public function updateReminder(User $user, CompanyNote $note){
        return $this->update($user, $note);
    }

    /**
     * Actualizar relevancia.
     */
    public function updateRelevance(User $user, CompanyNote $note){
        return $this->update($user, $note);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers internos
    |--------------------------------------------------------------------------
    */

    protected function hasCompanyContext(): bool{
        // Usamos el mismo patrón que en tus controllers
        $ctx = app(CompanyContext::class);

        return (int) $ctx->id() > 0;
    }

    /**
     * Comprueba que la nota pertenece a la empresa actual del contexto.
     */
    protected function sameCompany(CompanyNote $note): bool{
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        // \Log::debug('CompanyNotePolicy::sameCompany', [
        // 'note_id'          => $note->id,
        // 'note_company_id'  => $note->company_id,
        // 'ctx_company_id'   => $currentCompanyId,
        // ]);

        if ($currentCompanyId <= 0) {
            return false;
        }

        return (int) $note->company_id === (int) $currentCompanyId;
    }

    /**
     * Ver empresas y, por extensión, sus notas (solo lectura).
     */
    protected function canShowCompanies(User $user): bool{
        return $user->can('companies.show');
    }

    /**
     * Editar empresas y, por extensión, poder CRUDear sus notas.
     */
    protected function canEditCompanies(User $user): bool{
        return $user->can('companies.edit');
    }
}
