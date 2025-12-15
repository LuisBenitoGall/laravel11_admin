<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

//Models:
use App\Models\MarketingList;
use App\Models\MarketingListUser;
use App\Models\User;

class MarketingListUserController extends Controller
{
    /**
     * 1. Búsqueda de usuarios.
     * 2. Guardar miembro.
     * 3. Eliminar miembro de listado.
     * 4. Clonar listas.
     * 5. Guardar miembros desde un listado de contactos CRM.
     */
    
    /**
     * 1. Búsqueda de usuarios.
     * 
     * Autocomplete de usuarios para añadir a una lista de marketing.
     * Excluye los que ya son miembros de la lista.
     */
    public function search(Request $request, MarketingList $list)
    {
        $term = trim(
            (string) $request->input(
                'q',
                $request->input('term', $request->input('search', ''))
            )
        );

        $limit = (int) $request->input('limit', 15);

        // Usuarios ya vinculados a la lista
        $usedUserIds = MarketingListUser::query()
            ->where('marketing_list_id', $list->id)
            ->pluck('user_id');

        $query = User::query()
            ->select('users.id', 'users.name', 'users.surname', 'users.email')
            ->where('users.status', 1)
            ->when($usedUserIds->isNotEmpty(), function ($q) use ($usedUserIds) {
                $q->whereNotIn('users.id', $usedUserIds);
            });

        if ($term !== '') {
            $query->where(function ($sub) use ($term) {
                $sub->where('users.name', 'like', "%{$term}%")
                    ->orWhere('users.surname', 'like', "%{$term}%")
                    ->orWhere('users.email', 'like', "%{$term}%");
            });
        }

        $users = $query
            ->orderBy('users.name')
            ->limit($limit > 0 ? $limit : 15)
            ->get()
            ->map(function ($user) {
                return [
                    'id'        => $user->id,
                    'name'      => trim($user->name . ' ' . $user->surname),
                    'email'     => $user->email,
                    'full_name' => trim($user->name . ' ' . $user->surname),
                ];
            });

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * 2. Guardar miembro.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'marketing_list_id' => ['required', 'exists:marketing_lists,id'],
            'user_id'           => ['required', 'exists:users,id'],
            'observations'      => ['nullable', 'string', 'max:500']
        ]);

        // evitar duplicados por si acaso
        $exists = MarketingListUser::where('marketing_list_id', $data['marketing_list_id'])
            ->where('user_id', $data['user_id'])
            ->exists();

        if(!$exists){
            $list = MarketingListUser::create([
                'marketing_list_id' => $data['marketing_list_id'],
                'user_id'           => $data['user_id'],
                'observations'      => $data['observations'] ?? null,
                'status'            => 1,
                'created_by'        => auth()->id()
            ]);

            //Actualizando nº de miembros de la lista:
            $membersCount = MarketingListUser::countForList($list->marketing_list_id);

            MarketingList::where('id', $list->marketing_list_id)
            ->update(['members_count' => $membersCount]);
        }

        return back()->with('msg', __('usuario_anadido_ok'));
    }

    /**
     * 3. Eliminar miembro de listado.
     */
    public function destroy($marketing_list_user_id)
    {
        $link = MarketingListUser::findOrFail($marketing_list_user_id);

        // Aquí podrías validar permisos / empresa si quieres
        $link->delete();

        return back()->with('msg', __('miembro_eliminado'));
    }

    /**
     * 4. Clonar listas.
     */
    public function cloneFromLists(Request $request, MarketingList $list)
    {
        $data = $request->validate([
            'source_list_ids'   => ['required', 'array', 'min:1'],
            'source_list_ids.*' => ['integer', 'distinct', 'exists:marketing_lists,id'],
        ]);

        $companyId = $list->company_id;

        // Listas origen válidas (misma empresa y activas)
        $sourceListIds = MarketingList::query()
            ->whereIn('id', $data['source_list_ids'])
            ->where('company_id', $companyId)
            ->where('status', 1)
            ->pluck('id')
            ->all();

        if (empty($sourceListIds)) {
            return back()->with('alert', __('listas_origen_no_validas'));
        }

        // Usuarios de las listas origen
        $sourceUserIds = MarketingListUser::query()
            ->whereIn('marketing_list_id', $sourceListIds)
            ->pluck('user_id')
            ->unique()
            ->values();

        if ($sourceUserIds->isEmpty()) {
            return back()->with('alert', __('sin_usuarios_para_copiar'));
        }

        // Usuarios ya presentes en la lista destino
        $existingUserIds = MarketingListUser::query()
            ->where('marketing_list_id', $list->id)
            ->pluck('user_id');

        // Solo insertamos los nuevos
        $newUserIds = $sourceUserIds->diff($existingUserIds)->values();

        if ($newUserIds->isEmpty()) {
            return back()->with('msg', __('usuarios_ya_presentes_en_lista'));
        }

        $now    = now();
        $userId = Auth::id();

        DB::beginTransaction();

        try {
            $rows = [];

            foreach ($newUserIds as $uid) {
                $rows[] = [
                    'marketing_list_id' => $list->id,
                    'user_id'           => $uid,
                    'status'            => 1,
                    'observations'      => null,
                    'created_by'        => $userId,
                    'updated_by'        => $userId,
                    'created_at'        => $now,
                    'updated_at'        => $now,
                ];
            }

            // Insert en chunks para no reventar el límite de placeholders
            foreach (array_chunk($rows, 500) as $chunk) {
                MarketingListUser::insert($chunk);
            }

            // Actualizamos members_count
            $membersCount = MarketingListUser::countForList($list->id);

            MarketingList::where('id', $list->id)
                ->update(['members_count' => $membersCount]);

            DB::commit();

            return back()->with('msg', __('usuarios_copiados_desde_listas'));
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Error clonando listas de marketing', [
                'list_id'  => $list->id,
                'sources'  => $sourceListIds,
                'error'    => $e->getMessage(),
            ]);

            return back()->with('alert', __('error_clonando_listas'));
        }
    }

    /**
     * 5. Guardar miembros desde un listado de contactos CRM.
     */
    public function storeFromContacts(Request $request, MarketingList $list)
    {
        $data = $request->validate([
            'user_ids'   => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ]);

        // Normalizamos y quitamos duplicados
        $userIds = collect($data['user_ids'])
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        if ($userIds->isEmpty()) {
            return back()->with('alert', __('sin_usuarios_para_guardar'));
        }

        // Usuarios ya presentes en la lista destino
        $existingUserIds = MarketingListUser::query()
            ->where('marketing_list_id', $list->id)
            ->whereIn('user_id', $userIds)
            ->pluck('user_id')
            ->all();

        $newUserIds = $userIds->diff($existingUserIds)->values();

        if ($newUserIds->isEmpty()) {
            return back()->with('msg', __('usuarios_ya_presentes_en_lista'));
        }

        $now    = now();
        $authId = Auth::id();

        // Insertamos en trozos para no reventar el límite de placeholders
        DB::beginTransaction();

        try {
            $rows = [];

            foreach ($newUserIds as $uid) {
                $rows[] = [
                    'marketing_list_id' => $list->id,
                    'user_id'           => $uid,
                    'observations'      => null,
                    'status'            => 1,
                    'created_by'        => $authId,
                    'updated_by'        => $authId,
                    'created_at'        => $now,
                    'updated_at'        => $now,
                ];
            }

            // tamaño de chunk configurable; 500 es bastante seguro
            foreach (array_chunk($rows, 500) as $chunk) {
                MarketingListUser::insert($chunk);
            }

            // Actualizamos members_count de la lista
            $membersCount = MarketingListUser::countForList($list->id);

            MarketingList::where('id', $list->id)
                ->update(['members_count' => $membersCount]);

            DB::commit();

            return redirect()
            ->route('marketing-lists.edit', [$list->id, 'members'])
            ->with('msg', __('miembros_agregados'));

        } catch (\Throwable $e) {
            DB::rollBack();

            // Si quieres registrar el drama:
            \Log::error('Error al guardar miembros desde contactos', [
                'list_id'  => $list->id,
                'error'    => $e->getMessage(),
                'user_ids' => $newUserIds->all(),
            ]);

            return back()->with('alert', __('error_guardando_miembros'));
        }
    }

}
