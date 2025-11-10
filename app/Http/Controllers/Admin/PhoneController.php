<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use libphonenumber\PhoneNumberUtil;
use libphonenumber\PhoneNumberFormat;

//Models:
use App\Models\Company;
use App\Models\CrmContact;
use App\Models\Phone;
use App\Models\User;

//Requests:
use App\Http\Requests\PhoneStoreRequest;
use App\Http\Requests\PhoneUpdateRequest;

class PhoneController extends Controller{
    /**
     * 1. Teléfonos por entidad.
     * 2. Guardar teléfono.
     * 3. Actualizar teléfono.
     * 4. Eliminar teléfono.
     * 5. Marcar teléfono primario.
     * 6. Verificar teléfono.
     */

    /**
     * 1. Teléfonos por entidad.
     */
    public function getBy(int $id, string $entity): JsonResponse{
        // Normaliza el identificador de entidad
        $key = strtolower(preg_replace('/[^a-zA-Z]/', '', $entity));

        // Mapeo de entidades soportadas
        $map = [
            'user'       => User::class,
            'company'    => Company::class,
            'crmcontact' => CrmContact::class,
        ];

        if (!isset($map[$key])) {
            return response()->json([
                'message' => __('entidad_no_soportada'),
                'entity'  => $entity,
            ], 422);
        }

        $ownerClass = $map[$key];

        // Si no existe el owner, 404
        $owner = $ownerClass::find($id);
        if (!$owner) {
            return response()->json([
                'message' => __('recurso_no_encontrado'),
                'id'      => $id,
                'entity'  => $entity,
            ], 404);
        }

        // Selección mínima necesaria; excluye soft-deleted por defecto
        $phones = Phone::query()
            ->where('phoneable_type', $ownerClass)
            ->where('phoneable_id', $owner->getKey())
            ->orderByDesc('is_primary')
            ->orderBy('id')
            ->get([
                'id',
                'e164',
                'type',
                'label',
                'ext',
                'is_whatsapp',
                'is_primary',
                'is_verified',
                'verified_at',
                'notes',
                'created_at',
                'updated_at',
            ]);

        return response()->json($phones, 200);
    }

    /**
     * 2. Guardar teléfono.
     */
    public function store(PhoneStoreRequest $request){
        // Normaliza el tipo recibido desde el cliente
        $type = (string) $request->input('phoneable_type', '');
        $id   = (int) $request->input('phoneable_id');

        switch ($type) {
            case 'User':
                $owner = User::find($id);
                $route = 'users.edit';
                break;

            case 'Company':
                $owner = Company::find($id);
                $route = 'companies.edit';
                break;

            case 'CrmContact': // <- no 'Contact'
                $owner = CrmContact::find($id);
                $route = 'contacts.edit';
                break;

            default:
                return redirect()->back()->with('alert', __('entidad_no_soportada'));
        }

        if (!$owner) {
            return redirect()->back()->with('alert', __('recurso_no_encontrado'));
        }

        // Construimos el array de items que espera el modelo.
        // Tu componente envía un único número y metadatos sueltos.
        $items = [[
            'number'      => $request->input('number'),          // string, el modelo lo normaliza a E.164 (ES por defecto)
            'type'        => $request->input('type', 'mobile'),  // mobile|landline|other
            'label'       => $request->input('label') ?: null,
            'ext'         => $request->input('ext') ?: null,
            'is_primary'  => (bool) $request->boolean('is_primary'),
            'is_whatsapp' => (bool) $request->boolean('is_whatsapp'),
            'notes'       => $request->input('notes') ?: null,
        ]];

        // Solo usamos options para la región por defecto
        $options = ['default_region' => 'ES'];

        Phone::addOrUpdateFor($owner, $items, $options);

        return redirect()->route($route, $id)->with('msg', __('telefono_creado_msg'));
    }

    /**
     * 3. Actualizar teléfono.
     */
    public function update(PhoneUpdateRequest $request, Phone $phone){
        try{
            $validated = $request->validated();

            $ownerClass = $phone->phoneable_type;     // ej. App\Models\User
            $ownerId    = $phone->phoneable_id;

            $routeMap = [
                \App\Models\User::class       => 'users.edit',
                \App\Models\Company::class    => 'companies.edit',
                \App\Models\CrmContact::class => 'contacts.edit',
            ];
            $route = $routeMap[$ownerClass] ?? 'dashboard';

            $util = PhoneNumberUtil::getInstance();
            $defaultRegion = 'ES';

            $newE164 = null;
            if ($request->filled('number')) {
                $raw = preg_replace('/\s+/u', '', (string) $request->input('number'));
                try {
                    $parsed = $util->parse($raw, $defaultRegion);
                    if ($util->isValidNumber($parsed)) {
                        $newE164 = $util->format($parsed, PhoneNumberFormat::E164);
                    } else {
                        // número inválido: devuelvo error de validación
                        return back()->withErrors(['number' => __('telefono_invalido')])->withInput();
                    }
                } catch (\Throwable $e) {
                    return back()->withErrors(['number' => __('telefono_invalido')])->withInput();
                }
            }

            DB::transaction(function () use ($request, $phone, $ownerClass, $ownerId, $newE164) {
                $makePrimary = (bool) $request->boolean('is_primary');

                // Si cambia el número, gestiona duplicados por (owner, e164)
                if ($newE164 !== null && $newE164 !== $phone->e164) {
                    // ¿Existe otro registro con este e164 para el mismo owner?
                    $duplicate = Phone::withTrashed()
                        ->where('phoneable_type', $ownerClass)
                        ->where('phoneable_id', $ownerId)
                        ->where('e164', $newE164)
                        ->where('id', '!=', $phone->id)
                        ->first();

                    if ($duplicate) {
                        if ($duplicate->trashed()) {
                            $duplicate->restore();
                        }

                        // Actualizamos el duplicado con los metadatos nuevos...
                        $duplicate->type        = $request->input('type', $duplicate->type);
                        $duplicate->label       = $request->input('label') ?: null;
                        $duplicate->ext         = $request->input('ext') ?: null;
                        $duplicate->is_whatsapp = (bool) $request->boolean('is_whatsapp');
                        $duplicate->notes       = $request->input('notes') ?: null;

                        if ($makePrimary) {
                            Phone::where('phoneable_type', $ownerClass)
                                ->where('phoneable_id', $ownerId)
                                ->where('is_primary', true)
                                ->update(['is_primary' => false]);
                            $duplicate->is_primary = true;
                        }

                        $duplicate->save();

                        // ...y retiramos este registro para respetar el unique (soft delete)
                        $phone->delete();
                        return;
                    }

                    // No hay duplicado: simplemente cambiamos el e164
                    $phone->e164 = $newE164;
                }

                // Actualiza metadatos
                $phone->type        = $request->input('type', $phone->type);
                $phone->label       = $request->input('label') ?: null;
                $phone->ext         = $request->input('ext') ?: null;
                $phone->is_whatsapp = (bool) $request->boolean('is_whatsapp');
                $phone->notes       = $request->input('notes') ?: null;

                // Primario único
                if ($makePrimary) {
                    Phone::where('phoneable_type', $ownerClass)
                        ->where('phoneable_id', $ownerId)
                        ->where('is_primary', true)
                        ->where('id', '!=', $phone->id)
                        ->update(['is_primary' => false]);
                    $phone->is_primary = true;
                } else {
                    // Si el usuario desmarca primario, respetamos su elección
                    $phone->is_primary = false;
                }

                $phone->save();
            });

            return redirect()->route($route, $ownerId)->with('msg', __('telefono_actualizado_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }       
    }

    /**
     * 4. Eliminar teléfono.
     */
    public function destroy(Phone $phone){
        $id = $phone->phoneable_id;

        switch($phone->phoneable_type){
            case 'App\Models\User':
                $route = 'users.edit';
                break;
            case 'App\Models\Company':
                $route = 'companies.edit';
                break;
            default:
                // code...
                break;
        }

        $phone->delete();

        return redirect()->route($route, $id)->with('msg', __('telefono_eliminado_msg'));
    }

    /**
     * 5. Marcar teléfono primario.
     */
    public function primary(Request $request){
        // 1) Validación básica
        $data = $request->validate([
            'phone_id'       => ['required', 'integer', 'exists:phones,id'],
            'phoneable_type' => ['required', 'string', 'in:User,Company,CrmContact'],
            'phoneable_id'   => ['required', 'integer'],
        ]);

        // 2) Resolver clase del owner
        $classMap = [
            'User'       => User::class,
            'Company'    => Company::class,
            'CrmContact' => CrmContact::class,
        ];
        $ownerClass = $classMap[$data['phoneable_type']] ?? null;

        // 3) Localizar el teléfono asegurando pertenencia
        $phone = Phone::query()
            ->where('id', $data['phone_id'])
            ->where('phoneable_type', $ownerClass)
            ->where('phoneable_id', $data['phoneable_id'])
            ->first();

        if (!$phone) {
            // No existe o no pertenece al owner indicado
            return $request->wantsJson()
                ? response()->json(['message' => __('recurso_no_encontrado')], 404)
                : back()->with('alert', __('recurso_no_encontrado'));
        }

        // 4) Transacción: quitar primario al resto, poner este como primario
        DB::transaction(function () use ($ownerClass, $data, $phone) {
            Phone::where('phoneable_type', $ownerClass)
                ->where('phoneable_id', $data['phoneable_id'])
                ->where('is_primary', true)
                ->update(['is_primary' => false]);

            $phone->is_primary = true;
            $phone->save();
        });

        // 5) Respuesta
        if ($request->wantsJson()) {
            return response()->json(['status' => 'ok'], 200);
        }

        // Si llegas por Inertia router.post, un flash y arreando
        return back()->with('msg', __('telefono_primario_actualizado'));
    }

    /**
     * 6. Verificar teléfono.
     */
    public function verify(Request $request){
        $data = $request->validate([
            'phone_id' => ['required', 'integer', 'exists:phones,id'],
        ]);

        $phone = Phone::find($data['phone_id']);

        if (!$phone) {
            // por si acaso, aunque el exists ya lo cubre
            return $request->wantsJson()
                ? response()->json(['message' => __('recurso_no_encontrado')], 404)
                : back()->with('alert', __('recurso_no_encontrado'));
        }

        // 3) Idempotente: si no está verificado, marcar y poner timestamp
        if (!$phone->is_verified) {
            $phone->is_verified = true;
            $phone->verified_at = Carbon::now();
            $phone->save();
        }

        // 4) Respuesta
        if ($request->wantsJson()) {
            return response()->json([
                'status'       => 'ok',
                'id'           => $phone->id,
                'is_verified'  => $phone->is_verified,
                'verified_at'  => optional($phone->verified_at)->toISOString(),
            ], 200);
        }

        return back()->with('msg', __('telefono_verificado_msg'));
    }
}
