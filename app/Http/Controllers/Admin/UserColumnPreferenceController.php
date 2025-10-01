<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

//Models:
use App\Models\UserColumnPreference;

class UserColumnPreferenceController extends Controller{
    /**
     * 1. Preferencias de usuario por tablas.
     * 2. Guardar preferencia.
     */
    

    /**
     * 1. Preferencias de usuario por tablas.
     */
    public function index(Request $request){
        $tables = $request->input('tables', []);

        if (!is_array($tables) || empty($tables)) {
            return response()->json([], 200);
        }

        $preferences = UserColumnPreference::forUserAndTables(auth()->user()->id, $tables);

        return response()->json($preferences);
    }

    /**
     * 2. Guardar preferencia.
     */
    public function store(Request $request){
        $data = $request->validate([
            'table' => 'required|string',
            'columns' => 'required|array',
            'columns.*' => 'string',
        ]);

        $preference = UserColumnPreference::updateOrCreate(
            [
                'user_id' => auth()->user()->id,
                'table' => $data['table']
            ],
            [
                'columns' => $data['columns']
            ]
        );

        return response()->json(['status' => 'ok']);
    }
}
