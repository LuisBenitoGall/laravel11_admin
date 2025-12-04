<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        if (!$exists) {
            MarketingListUser::create([
                'marketing_list_id' => $data['marketing_list_id'],
                'user_id'           => $data['user_id'],
                'observations'      => $data['observations'] ?? null,
                'status'            => 1,
                'created_by'        => auth()->id(),
            ]);
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

        // Filtramos listas origen a las de la misma empresa y activas
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
            ->values()
            ->all();

        if (empty($sourceUserIds)) {
            return back()->with('alert', __('sin_usuarios_para_copiar'));
        }

        // Usuarios ya presentes en la lista destino
        $existingUserIds = MarketingListUser::query()
            ->where('marketing_list_id', $list->id)
            ->pluck('user_id')
            ->all();

        // Solo insertamos los nuevos
        $newUserIds = array_values(array_diff($sourceUserIds, $existingUserIds));

        if (empty($newUserIds)) {
            return back()->with('msg', __('usuarios_ya_presentes_en_lista'));
        }

        $now = now();
        $userId = Auth::id();

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

        if (!empty($rows)) {
            MarketingListUser::insert($rows);
        }

        return back()->with('msg', __('usuarios_copiados_desde_listas'));
    }

}
