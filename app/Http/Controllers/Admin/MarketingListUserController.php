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

        $limit = max((int) $request->input('limit', 15), 1);

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
            // troceamos por espacios: "paco sin" => ["paco", "sin"]
            $tokens = preg_split('/\s+/', $term);

            $query->where(function ($sub) use ($tokens) {
                foreach ($tokens as $token) {
                    $token = trim($token);
                    if ($token === '') {
                        continue;
                    }

                    $like = "%{$token}%";

                    // Cada token debe aparecer al menos en name, surname o email
                    // Agrupamos por token y combinamos los tokens con AND
                    $sub->where(function ($qq) use ($like) {
                        $qq->where('users.name', 'like', $like)
                           ->orWhere('users.surname', 'like', $like)
                           ->orWhere('users.email', 'like', $like);
                    });
                }
            });
        }

        $users = $query
            ->orderBy('users.name')
            ->limit($limit)
            ->get()
            ->map(function ($user) {
                $fullName = trim($user->name . ' ' . $user->surname);

                return [
                    'id'        => $user->id,
                    'name'      => $fullName,
                    'email'     => $user->email,
                    'full_name' => $fullName,
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
            'observations'      => ['nullable', 'string', 'max:500'],
        ]);

        $listId = (int) $data['marketing_list_id'];
        $userId = (int) $data['user_id'];

        /** @var \App\Models\User $user */
        $user = User::findOrFail($userId);

        // Helper para decidir si respondemos en JSON o con redirect
        $respondJson = $request->expectsJson() || $request->wantsJson();

        // 1) Veto de marketing (tu lógica interna)
        if (! $user->canReceiveMarketingEmails()) {
            $message = __('usuario_no_emails');

            if ($respondJson) {
                // 422: fallo de regla de negocio / validación
                return response()->json([
                    'message' => $message,
                ], 422);
            }

            return back()->with('alert', $message);
        }

        // 2) Evitar duplicados en la lista
        $existing = MarketingListUser::where('marketing_list_id', $listId)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $message = __('usuario_ya_presente_en_lista');

            if ($respondJson) {
                return response()->json([
                    'message' => $message,
                ], 422);
            }

            return back()->with('msg', $message);
        }

        // 3) Crear vínculo
        $link = MarketingListUser::create([
            'marketing_list_id' => $listId,
            'user_id'           => $userId,
            'observations'      => $data['observations'] ?? null,
            'status'            => 1,
            'created_by'        => auth()->id(),
            'updated_by'        => auth()->id(),
        ]);

        // 4) Recalcular nº de miembros
        $membersCount = MarketingListUser::countForList($listId);

        MarketingList::where('id', $listId)
            ->update(['members_count' => $membersCount]);

        $message = __('usuario_anadido_ok');

        if ($respondJson) {
            // respuesta pensada para el modal (axios)
            $fullName = trim($user->name . ' ' . $user->surname);

            return response()->json([
                'message' => $message,
                'data'    => [
                    'id'             => $link->id,
                    'user_id'        => $user->id,
                    'name'           => $fullName,
                    'email'          => $user->email,
                    'members_count'  => $membersCount,
                ],
            ]);
        }

        // modo “clásico” (submit normal)
        return back()->with('msg', $message);
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

        // Usuarios de las listas origen (ids únicos)
        $sourceUserIds = MarketingListUser::query()
            ->whereIn('marketing_list_id', $sourceListIds)
            ->pluck('user_id')
            ->unique()
            ->values();

        if ($sourceUserIds->isEmpty()) {
            return back()->with('alert', __('sin_usuarios_para_copiar'));
        }

        // 1) Cargamos usuarios y aplicamos veto centralizado (accept_emails, status, email, etc.)
        $users = User::whereIn('id', $sourceUserIds)->get();

        $eligibleUsers = $users->filter(function (User $user) {
            return $user->canReceiveMarketingEmails();
        });

        $eligibleIds = $eligibleUsers->pluck('id')->values();

        if ($eligibleIds->isEmpty()) {
            return back()->with('alert', __('ningun_usuario_puede_recibir_emails'));
        }

        // 2) Usuarios ya presentes en la lista destino (entre los elegibles)
        $existingUserIds = MarketingListUser::query()
            ->where('marketing_list_id', $list->id)
            ->whereIn('user_id', $eligibleIds)
            ->pluck('user_id');

        // Solo insertamos los nuevos y elegibles
        $newUserIds = $eligibleIds->diff($existingUserIds)->values();

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

        // 1) Cargamos usuarios y aplicamos veto centralizado (accept_emails, status, email, etc.)
        $users = User::whereIn('id', $userIds)->get();

        $eligibleUsers = $users->filter(function (User $user) {
            return $user->canReceiveMarketingEmails();
        });

        $eligibleIds = $eligibleUsers->pluck('id')->values();

        // Si nadie de los seleccionados puede recibir marketing, salimos
        if ($eligibleIds->isEmpty()) {
            return back()->with('alert', __('ningun_usuario_puede_recibir_emails'));
        }

        // 2) Usuarios ya presentes en la lista destino (entre los elegibles)
        $existingUserIds = MarketingListUser::query()
            ->where('marketing_list_id', $list->id)
            ->whereIn('user_id', $eligibleIds)
            ->pluck('user_id')
            ->all();

        // Solo insertamos los que:
        //  - pueden recibir marketing
        //  - aún no están en la lista
        $newUserIds = $eligibleIds->diff($existingUserIds)->values();

        if ($newUserIds->isEmpty()) {
            return back()->with('msg', __('usuarios_ya_presentes_en_lista'));
        }

        $now    = now();
        $authId = Auth::id();

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

            // Insertamos en trozos para no reventar el límite de placeholders
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

            \Log::error('Error al guardar miembros desde contactos', [
                'list_id'  => $list->id,
                'error'    => $e->getMessage(),
                'user_ids' => $newUserIds->all(),
            ]);

            return back()->with('alert', __('error_guardando_miembros'));
        }
    }

}
