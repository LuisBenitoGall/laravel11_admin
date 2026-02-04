<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Models:
use App\Models\UserAddress;

class UserAddressController extends Controller
{
    /**
     * 1. Guardar dirección.
     * 2. Actualizar dirección.
     * 3. Eliminar dirección.
     * 4. Marcar dirección principal.
     */

    /**
     * 1. Guardar dirección.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'        => ['required', 'integer'],
            'label'          => ['nullable', 'string', 'max:100'],
            'address'        => ['nullable', 'string', 'max:255'],
            'address_extra'  => ['nullable', 'string', 'max:255'],
            'cp'             => ['nullable', 'string', 'max:10'],
            'town_id'        => ['nullable', 'exists:towns,id'],
            'observations'   => ['nullable', 'string'],
            'is_main'        => ['nullable', 'boolean'],
        ]);

        $this->validateAtLeastOneLocation($request);

        $validated['is_main'] = (bool) ($validated['is_main'] ?? false);

        if ($validated['is_main']) {
            UserAddress::where('user_id', $validated['user_id'])
                ->update(['is_main' => false]);
        }

        UserAddress::create($validated);

        return back()->with('success', __('direccion_creada'));
    }

    /**
     * 2. Actualizar dirección.
     */
    public function update(Request $request, UserAddress $address)
    {
        // Opcional: comprobar coherencia de usuario si te llega user_id
        if ($request->filled('user_id') && (int) $request->user_id !== (int) $address->user_id) {
            abort(403);
        }

        // Caso 1: sólo marcar como principal (petición desde la estrella)
        if ($request->has('is_main') && !$request->has('address')) {
            $isMain = (bool) $request->input('is_main', false);

            if ($isMain) {
                UserAddress::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_main' => false]);
            }

            $address->update(['is_main' => $isMain]);

            return back()->with('success', __('Dirección actualizada correctamente.'));
        }

        // Caso 2: edición completa desde el modal
        $validated = $request->validate([
            'label'          => ['nullable', 'string', 'max:100'],
            'address'        => ['nullable', 'string', 'max:255'],
            'address_extra'  => ['nullable', 'string', 'max:255'],
            'cp'             => ['nullable', 'string', 'max:10'],
            'town_id'        => ['nullable', 'exists:towns,id'],
            'observations'   => ['nullable', 'string'],
            'is_main'        => ['nullable', 'boolean'],
        ]);

        $this->validateAtLeastOneLocation($request);

        $validated['is_main'] = (bool) ($validated['is_main'] ?? false);

        if ($validated['is_main']) {
            UserAddress::where('user_id', $address->user_id)
                ->where('id', '!=', $address->id)
                ->update(['is_main' => false]);
        }

        $address->update($validated);

        return back()->with('success', __('Dirección actualizada correctamente.'));
    }

    /**
     * 3. Eliminar dirección.
     */
    public function destroy(UserAddress $address)
    {
        $address->delete();

        return back()->with('success', __('Dirección eliminada correctamente.'));
    }

    /**
     * 4. Marcar dirección principal.
     */
    public function primary(Request $request)
    {
        // 1) Validación básica
        $data = $request->validate([
            'address_id' => ['required', 'integer', 'exists:user_addresses,id'],
            'user_id'    => ['required', 'integer'],
        ]);

        // 2) Localizar la dirección asegurando pertenencia
        $address = UserAddress::query()
            ->where('id', $data['address_id'])
            ->where('user_id', $data['user_id'])
            ->first();

        if (! $address) {
            // No existe o no pertenece al usuario indicado
            return $request->wantsJson()
                ? response()->json(['message' => __('recurso_no_encontrado')], 404)
                : back()->with('alert', __('recurso_no_encontrado'));
        }

        // 3) Transacción: quitar principal al resto, marcar esta como principal
        DB::transaction(function () use ($address) {
            UserAddress::where('user_id', $address->user_id)
                ->where('is_main', true)
                ->update(['is_main' => false]);

            $address->is_main = true;
            $address->save();
        });

        // 4) Respuesta
        if ($request->wantsJson()) {
            return response()->json(['status' => 'ok'], 200);
        }

        return back()->with('msg', __('direccion_principal_actualizada'));
    }

    /**
     * Exige al menos uno de: población (town_id), código postal (cp) o dirección (address).
     */
    private function validateAtLeastOneLocation(Request $request): void
    {
        $townId = $request->input('town_id');
        $cp     = trim((string) $request->input('cp', ''));
        $address = trim((string) $request->input('address', ''));

        $hasTown   = $townId !== null && $townId !== '';
        $hasCp     = $cp !== '';
        $hasAddress = $address !== '';

        if (!$hasTown && !$hasCp && !$hasAddress) {
            throw ValidationException::withMessages([
                'address' => [__('direccion_al_menos_uno')],
            ]);
        }
    }
}
