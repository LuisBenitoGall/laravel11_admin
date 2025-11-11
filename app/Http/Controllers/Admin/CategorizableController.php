<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\CompanyContext;

//Models:
use App\Models\Category;
use App\Models\Categorizable;

class CategorizableController extends Controller{
    /**
     * 1. Asignar categoría a entidad.
     * 2. Desasignar categoría a entidad.
     * 3. Reemplazar categoría en entidad.
     */


    /**
     * 1. Asignar categoría a entidad.
     */
    public function assign(Request $request, CompanyContext $ctx, string $module){
        // body: categorizable_type, categorizable_ids[], category_ids[], is_primary?
        $this->authorize('assign', [Categorizable::class, $ctx->id(), $module]);

        $data = $request->validate([
            'categorizable_type' => 'required|string',
            'categorizable_ids'  => 'required|array',
            'categorizable_ids.*'=> 'integer',
            'category_ids'       => 'required|array',
            'category_ids.*'     => 'integer',
            'is_primary'         => 'boolean',
        ]);

        DB::transaction(function () use ($ctx, $module, $data) {
            foreach ($data['categorizable_ids'] as $rid) {
                foreach ($data['category_ids'] as $cid) {
                    Categorizable::firstOrCreate([
                        'company_id'         => $ctx->id(),
                        'category_id'        => $cid,
                        'categorizable_type' => $data['categorizable_type'],
                        'categorizable_id'   => $rid,
                    ], [
                        'is_primary' => (bool) ($data['is_primary'] ?? false),
                    ]);
                }
            }
        });

        return response()->noContent();
    }

    /**
     * 2. Desasignar categoría a entidad.
     */
    public function unassign(Request $request, CompanyContext $ctx, string $module){
        $this->authorize('assign', [Categorizable::class, $ctx->id(), $module]);

        $data = $request->validate([
            'categorizable_type' => 'required|string',
            'categorizable_ids'  => 'required|array',
            'category_ids'       => 'required|array',
        ]);

        Categorizable::where('company_id', $ctx->id())
            ->where('categorizable_type', $data['categorizable_type'])
            ->whereIn('categorizable_id', $data['categorizable_ids'])
            ->whereIn('category_id', $data['category_ids'])
            ->delete();

        return response()->noContent();
    }

    /**
     * 3. Reemplazar categoría en entidad.
     */
    public function replace(Request $request, CompanyContext $ctx, string $module){
        $this->authorize('assign', [Categorizable::class, $ctx->id(), $module]);

        $data = $request->validate([
            'categorizable_type' => 'required|string',
            'categorizable_ids'  => 'required|array',
            'category_ids'       => 'array', // nuevas
        ]);

        DB::transaction(function () use ($ctx, $data) {
            Categorizable::where('company_id', $ctx->id())
                ->where('categorizable_type', $data['categorizable_type'])
                ->whereIn('categorizable_id', $data['categorizable_ids'])
                ->delete();

            if (!empty($data['category_ids'])) {
                foreach ($data['categorizable_ids'] as $rid) {
                    foreach ($data['category_ids'] as $cid) {
                        Categorizable::create([
                            'company_id'         => $ctx->id(),
                            'category_id'        => $cid,
                            'categorizable_type' => $data['categorizable_type'],
                            'categorizable_id'   => $rid,
                            'is_primary'         => false,
                        ]);
                    }
                }
            }
        });

        return response()->noContent();
    }
}
