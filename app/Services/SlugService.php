<?php

namespace App\Services;

use Illuminate\Support\Str;

class SlugService
{
    /**
     * Genera un slug único para un modelo.
     *
     * @param  string  $modelClass   Clase del modelo (p.ej. \App\Models\MarketingList::class)
     * @param  string  $value        Texto base del que partir (normalmente el "name")
     * @param  array   $options      Opciones:
     *                               - slug_column    (string) nombre de la columna slug (por defecto: 'slug')
     *                               - company_id     (int|null) id de empresa para acotar (opcional)
     *                               - company_column (string|null) columna company_id (por defecto: 'company_id')
     *                               - ignore_id      (int|null) id a excluir (para updates)
     *
     * @return string
     */
    public function generate(string $modelClass, string $value, array $options = []): string
    {
        $slugColumn    = $options['slug_column'] ?? 'slug';
        $companyId     = $options['company_id'] ?? null;
        $companyColumn = $options['company_column'] ?? 'company_id';
        $ignoreId      = $options['ignore_id'] ?? null;

        $baseSlug = Str::slug($value);

        if ($baseSlug === '') {
            $baseSlug = 'item';
        }

        $slug = $baseSlug;

        if (!$this->slugExists($modelClass, $slug, $slugColumn, $companyId, $companyColumn, $ignoreId)) {
            return $slug;
        }

        $counter = 2;

        do {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        } while ($this->slugExists($modelClass, $slug, $slugColumn, $companyId, $companyColumn, $ignoreId));

        return $slug;
    }

    protected function slugExists(
        string $modelClass,
        string $slug,
        string $slugColumn,
        $companyId = null,
        ?string $companyColumn = 'company_id',
        $ignoreId = null
    ): bool {
        $query = $modelClass::query()
            ->where($slugColumn, $slug);

        if (!is_null($companyId) && $companyColumn) {
            $query->where($companyColumn, $companyId);
        }

        if (!is_null($ignoreId)) {
            $query->whereKeyNot($ignoreId);
        }

        return $query->exists();
    }
}
