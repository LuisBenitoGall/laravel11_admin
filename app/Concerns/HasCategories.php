<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Validation\ValidationException;

//Models:
use App\Models\Category;

trait HasCategories{
    /**
     * Determina el company_id a guardar/filtrar en el pivote.
     * - Si el modelo tiene company_id → ese valor.
     * - Si es Company → su propio id.
     * - En otro caso → company de la sesión.
     */
    protected function pivotCompanyId(): int{
        if (isset($this->company_id) && $this->company_id) {
            return (int) $this->company_id;
        }

        if ($this instanceof \App\Models\Company) {
            return (int) $this->id;
        }

        return (int) (session('currentCompany') ?: 0);
    }

    /**
     * Módulo de categorías esperado para este modelo (opcional).
     * Define en el modelo: protected $categoryModuleSlug = 'companies'|'users'|'products'|...
     */
    protected function expectedCategoryModule(): ?string{
        if (property_exists($this, 'categoryModuleSlug') && $this->categoryModuleSlug) {
            return (string) $this->categoryModuleSlug;
        }
        if (method_exists($this, 'categoryModuleSlug')) {
            return (string) $this->categoryModuleSlug();
        }
        return null;
    }

    /**
     * Relación polimórfica con Category a través de 'categorizables'.
     */
    public function categories(): MorphToMany{
        return $this->morphToMany(
                Category::class,
                'categorizable',
                'categorizables',
                'categorizable_id',
                'category_id'
            )
            ->withPivot(['company_id', 'extra', 'created_at'])
            ->wherePivot('company_id', $this->pivotCompanyId());
    }

    /**
     * Anexar una categoría (valida empresa y, si se define, módulo).
     */
    public function attachCategory($category, array $extra = []): void{
        $cat = $category instanceof Category ? $category : Category::findOrFail($category);
        $companyId = $this->pivotCompanyId();

        if ((int) $cat->company_id !== $companyId) {
            throw ValidationException::withMessages([
                'category_id' => 'La categoría pertenece a otra empresa.',
            ]);
        }

        $expected = $this->expectedCategoryModule();
        if ($expected && $cat->module !== $expected) {
            throw ValidationException::withMessages([
                'category_id' => 'La categoría es de otro módulo: '.$cat->module,
            ]);
        }

        $this->categories()->attach($cat->id, [
            'company_id' => $companyId,
            'extra' => $extra ?: null,
        ]);
    }

    /**
     * Sincronizar categorías (reemplaza todas).
     */
    public function syncCategories(array $categoryIds): void{
        $companyId = $this->pivotCompanyId();
        $expected = $this->expectedCategoryModule();

        $ids = Category::query()
            ->whereIn('id', $categoryIds)
            ->where('company_id', $companyId)
            ->when($expected, function ($q) use ($expected) {
                $q->where('module', $expected);
            })
            ->pluck('id')
            ->all();

        $payload = [];
        foreach ($ids as $id) {
            $payload[$id] = ['company_id' => $companyId];
        }

        $this->categories()->sync($payload);
    }
}
