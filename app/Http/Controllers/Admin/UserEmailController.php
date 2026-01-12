<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserEmail;
use Illuminate\Http\Request;

class UserEmailController extends Controller
{
    public function index(User $user)
    {
        $items = UserEmail::query()
            ->where('user_id', $user->id)
            ->orderBy('id')
            ->get(['id', 'user_id', 'email', 'observations', 'created_at', 'updated_at']);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'      => ['required', 'integer', 'exists:users,id'],
            'email'        => ['required', 'string', 'email', 'max:255'],
            'observations' => ['nullable', 'string', 'max:2000'],
        ]);

        $item = UserEmail::create([
            'user_id'      => (int) $data['user_id'],
            'email'        => $data['email'],
            'observations' => $data['observations'] ?? null,
        ]);

        // ✅ Inertia visit -> debe recibir redirect o response Inertia
        if ($request->header('X-Inertia')) {
            return redirect()->back(303);
        }

        return response()->json($item, 201);
    }

    public function update(Request $request, UserEmail $email)
    {
        $data = $request->validate([
            'user_id'      => ['required', 'integer', 'exists:users,id'],
            'email'        => ['required', 'string', 'email', 'max:255'],
            'observations' => ['nullable', 'string', 'max:2000'],
        ]);

        // coherencia: no permitir “mover” registros entre usuarios
        if ((int) $data['user_id'] !== (int) $email->user_id) {
            abort(422, __('error_generico'));
        }

        $email->update([
            'email'        => $data['email'],
            'observations' => $data['observations'] ?? null,
        ]);

        if ($request->header('X-Inertia')) {
            return redirect()->back(303);
        }

        return response()->json($email);
    }

    public function destroy(Request $request, UserEmail $email)
    {
        $email->delete();

        if ($request->header('X-Inertia')) {
            return redirect()->back(303);
        }

        return response()->json(['ok' => true]);
    }
}
