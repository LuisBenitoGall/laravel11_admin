<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\CompanyContext;

// Models
use App\Models\Category;
use App\Models\Categorizable;

class CategorizableController extends Controller{
    /**
     * 0. Utilidades
     */
    private function moduleSlugFor(string $environment): string
    {
        // Mismo criterio que en CategoryController
        return match ($environment) {
            'sectors'   => 'companies',
            'customers' => 'companies',
            'providers' => 'companies',
            'crm'       => 'crm',
            default     => 'companies',
        };
    }

    private function idArray(Request $request, string $singleKey, string $pluralKey): array
    {
        // admite un único id o un array de ids
        if ($request->filled($pluralKey) && is_array($request->input($pluralKey))) {
            return array_values(array_unique(array_map('intval', $request->input($pluralKey))));
        }
        if ($request->filled($singleKey)) {
            return [ (int) $request->input($singleKey) ];
        }
        return [];
    }

    private function validateCategoriesScope(array $categoryIds, int $companyId, string $module): array
    {
        if (empty($categoryIds)) {
            return [];
        }

        $ids = Category::query()
            ->where('company_id', $companyId)
            ->where('module', $module)
            ->where('status', 1)
            ->whereIn('id', $categoryIds)
            ->pluck('id')
            ->all();

        return $ids;
    }

    /**
     * LIST: categorías asignadas a una entidad (para precargar chips).
     * GET /categorizables/list?environment=...&type=...&id=...
     */
    public function list(Request $request, CompanyContext $ctx)
    {
        $data = $request->validate([
            'environment' => 'required|string',
            'type'        => 'required|string', // FQCN, ej. App\Models\Company
            'id'          => 'required|integer',
        ]);

        $module   = $this->moduleSlugFor($data['environment']); // usa tu helper
        $companyId = (int) $ctx->id();

        // IDs asignados (lo que necesita el front)
        $ids = Categorizable::query()
            ->where('categorizables.company_id', $companyId)
            ->where('categorizables.categorizable_type', $data['type'])
            ->where('categorizables.categorizable_id', $data['id'])
            ->join('categories', 'categories.id', '=', 'categorizables.category_id')
            ->where('categories.module', $module)
            ->whereNull('categories.deleted_at')
            ->pluck('categories.id')
            ->map(fn($v) => (int) $v)
            ->values();

        // Items con breadcrumb (por si quieres mostrar algo ya listo)
        $items = Categorizable::query()
            ->where('categorizables.company_id', $companyId)
            ->where('categorizables.categorizable_type', $data['type'])
            ->where('categorizables.categorizable_id', $data['id'])
            ->join('categories', 'categories.id', '=', 'categorizables.category_id')
            ->where('categories.module', $module)
            ->whereNull('categories.deleted_at')
            ->orderBy('categories.path')
            ->get(['categories.id', 'categories.name', 'categories.path', 'categories.slug'])
            ->map(function ($r) {
                return [
                    'id'         => (int) $r->id,
                    'name'       => (string) $r->name,
                    'breadcrumb' => str_replace('/', ' / ', (string) $r->path),
                ];
            });

        return response()->json([
            'category_ids' => $ids,   // <- esto es lo que usa CategoryAssigner
            'items'        => $items, // <- opcional, útil para debug o chips
        ]);
    }

    /**
     * ASSIGN: asigna una o varias categorías a una o varias entidades.
     * Body mínimo: environment, categorizable_type, categorizable_id, category_ids[]
     * Opcional: categorizable_ids[]
     */
    public function assign(Request $request, CompanyContext $ctx)
    {
        // Normaliza alias antes de validar
        $request->merge([
            'categorizable_type' => $request->input('categorizable_type', $request->input('type')),
            'categorizable_id'   => $request->input('categorizable_id',   $request->input('id')),
        ]);

        $data = $request->validate([
            'environment'         => 'required|string',
            'categorizable_type'  => 'required|string',
            'categorizable_id'    => 'nullable|integer',
            'categorizable_ids'   => 'nullable|array',
            'categorizable_ids.*' => 'integer',
            'category_id'         => 'nullable|integer',
            'category_ids'        => 'nullable|array',
            'category_ids.*'      => 'integer',
        ]);

        $companyId = (int) $ctx->id();
        $module    = $this->moduleSlugFor($data['environment']);

        $targetIds   = $this->idArray($request, 'categorizable_id', 'categorizable_ids');
        $categoryIds = $this->idArray($request, 'category_id', 'category_ids');

        if (empty($targetIds) || empty($categoryIds)) {
            return response()->json(['message' => 'Parámetros insuficientes'], 422);
        }

        $validCategoryIds = $this->validateCategoriesScope($categoryIds, $companyId, $module);
        if (empty($validCategoryIds)) {
            return response()->json(['message' => 'Categorías no válidas en este ámbito'], 422);
        }

        DB::transaction(function () use ($companyId, $data, $targetIds, $validCategoryIds) {
            foreach ($targetIds as $rid) {
                foreach ($validCategoryIds as $cid) {
                    Categorizable::firstOrCreate([
                        'company_id'         => $companyId,
                        'category_id'        => $cid,
                        'categorizable_type' => $data['categorizable_type'],
                        'categorizable_id'   => $rid,
                    ]);
                }
            }
        });

        return response()->noContent();
    }

    /**
     * UNASSIGN: elimina la relación para esas categorías.
     * Body: environment, categorizable_type, categorizable_id|categorizable_ids[], category_ids[]
     */
    public function unassign(Request $request, CompanyContext $ctx)
    {
        $request->merge([
            'categorizable_type' => $request->input('categorizable_type', $request->input('type')),
            'categorizable_id'   => $request->input('categorizable_id',   $request->input('id')),
        ]);

        $data = $request->validate([
            'environment'         => 'required|string',
            'categorizable_type'  => 'required|string',
            'categorizable_id'    => 'nullable|integer',
            'categorizable_ids'   => 'nullable|array',
            'categorizable_ids.*' => 'integer',
            'category_id'         => 'nullable|integer',
            'category_ids'        => 'nullable|array',
            'category_ids.*'      => 'integer',
        ]);

        $companyId   = (int) $ctx->id();
        $module      = $this->moduleSlugFor($data['environment']);

        $targetIds   = $this->idArray($request, 'categorizable_id', 'categorizable_ids');
        $categoryIds = $this->idArray($request, 'category_id', 'category_ids');

        if (empty($targetIds) || empty($categoryIds)) {
            return response()->json(['message' => 'Parámetros insuficientes'], 422);
        }

        $validCategoryIds = $this->validateCategoriesScope($categoryIds, $companyId, $module);
        if (empty($validCategoryIds)) {
            return response()->noContent();
        }

        Categorizable::where('company_id', $companyId)
            ->where('categorizable_type', $data['categorizable_type'])
            ->whereIn('categorizable_id', $targetIds)
            ->whereIn('category_id', $validCategoryIds)
            ->delete();

        return response()->noContent();
    }

    /**
     * REPLACE: borra todas las relaciones existentes y pone exactamente las dadas.
     * Body: environment, categorizable_type, categorizable_id|categorizable_ids[], category_ids[] (puede ir vacío)
     */
    public function replace(Request $request, CompanyContext $ctx)
    {
        $request->merge([
            'categorizable_type' => $request->input('categorizable_type', $request->input('type')),
            'categorizable_id'   => $request->input('categorizable_id',   $request->input('id')),
        ]);

        $data = $request->validate([
            'environment'         => 'required|string',
            'categorizable_type'  => 'required|string',
            'categorizable_id'    => 'nullable|integer',
            'categorizable_ids'   => 'nullable|array',
            'categorizable_ids.*' => 'integer',
            'category_ids'        => 'nullable|array',
            'category_ids.*'      => 'integer',
        ]);

        $companyId   = (int) $ctx->id();
        $module      = $this->moduleSlugFor($data['environment']);

        $targetIds   = $this->idArray($request, 'categorizable_id', 'categorizable_ids');
        $categoryIds = $this->idArray($request, 'category_id', 'category_ids');

        if (empty($targetIds)) {
            return response()->json(['message' => 'Parámetros insuficientes'], 422);
        }

        $validCategoryIds = $this->validateCategoriesScope($categoryIds, $companyId, $module);

        DB::transaction(function () use ($companyId, $data, $targetIds, $validCategoryIds) {
            Categorizable::where('company_id', $companyId)
                ->where('categorizable_type', $data['categorizable_type'])
                ->whereIn('categorizable_id', $targetIds)
                ->delete();

            foreach ($targetIds as $rid) {
                foreach ($validCategoryIds as $cid) {
                    Categorizable::create([
                        'company_id'         => $companyId,
                        'category_id'        => $cid,
                        'categorizable_type' => $data['categorizable_type'],
                        'categorizable_id'   => $rid,
                    ]);
                }
            }
        });

        return response()->noContent();
    }
}
