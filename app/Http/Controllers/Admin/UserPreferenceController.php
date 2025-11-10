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
use App\Models\Module;
use App\Models\UserPreference;

class UserPreferenceController extends Controller{
    /**
     * 1. Guardar preferencia. 
     * 2. Eliminar preferencia.
     */
    
    /**
     * 1. Guardar preferencia.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if ($companyId <= 0) {
            abort(422, __('no_hay_empresa_activa'));
        }

        $data = $request->validate([
            'name'   => ['required','string','max:255'],
            'url'    => ['required','string','max:255'],
            'module' => ['nullable','string','max:255'],
        ]);

        $pref = UserPreference::create([
            'name'       => trim($data['name']),
            'url'        => trim($data['url']),
            'module'     => $data['module'] ?? '',
            'user_id'    => Auth::id(),
            'company_id' => $companyId,
        ]);

        // Petición Inertia: 204 + X-Inertia para no mostrar el overlay
        if ($request->header('X-Inertia')) {
            return response('', 204)->header('X-Inertia', 'true');
        }

        // Petición AJAX normal: JSON
        return response()->json(['ok' => true, 'preference' => $pref]);
    }

    /**
     * 2. Eliminar preferencia.
     */
    public function destroy(Request $request, UserPreference $preference){
        $preference->delete();

        // if ($request->header('X-Inertia')) {
        //     // Mantenerse en la página actual sin recarga completa
        //     return response('', 204)->header('X-Inertia', 'true');
        // }

        return redirect()->route('dashboard.index')->with('msg', __('favorito_eliminado')); 
    }
}
