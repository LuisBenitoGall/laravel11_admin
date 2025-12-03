<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

//Models:
use App\Models\User;
use App\Models\UserAddress;

class UserAddressController extends Controller
{
    /**
     * Store a newly created address for a user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'        => ['required', 'integer'],
            'label'          => ['nullable', 'string', 'max:100'],
            'address'        => ['required', 'string', 'max:255'],
            'address_extra'  => ['nullable', 'string', 'max:255'],
            'cp'             => ['nullable', 'string', 'max:10'],
            'town_id'        => ['nullable', 'exists:towns,id'],
            'observations'   => ['nullable', 'string'],
            'is_main'        => ['nullable', 'boolean'],
        ]);

        $validated['user_id'] = $request->user_id;
        $validated['is_main'] = (bool) ($validated['is_main'] ?? false);

        // Si esta se marca como principal, desmarcamos el resto del usuario
        if ($validated['is_main']) {
            UserAddress::where('user_id', $request->user_id)
                ->update(['is_main' => false]);
        }

        UserAddress::create($validated);

        return back()->with('success', __('Dirección creada correctamente.'));
    }

    /**
     * Update the specified address.
     */
    public function update(Request $request, User $user, UserAddress $address)
    {
        // Seguridad básica: asegurarse de que la dirección pertenece al usuario
        if ($address->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'label'          => ['nullable', 'string', 'max:100'],
            'address'        => ['required', 'string', 'max:255'],
            'address_extra'  => ['nullable', 'string', 'max:255'],
            'cp'             => ['nullable', 'string', 'max:10'],
            'town_id'        => ['nullable', 'exists:towns,id'],
            'observations'   => ['nullable', 'string'],
            'is_main'        => ['nullable', 'boolean'],
        ]);

        $validated['is_main'] = (bool) ($validated['is_main'] ?? false);

        if ($validated['is_main']) {
            UserAddress::where('user_id', $user->id)
                ->where('id', '!=', $address->id)
                ->update(['is_main' => false]);
        }

        $address->update($validated);

        return back()->with('success', __('Dirección actualizada correctamente.'));
    }

    /**
     * Remove the specified address.
     */
    public function destroy(User $user, UserAddress $address)
    {
        if ($address->user_id !== $user->id) {
            abort(403);
        }

        $address->delete();

        return back()->with('success', __('Dirección eliminada correctamente.'));
    }
}
