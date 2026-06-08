<?php

namespace App\Support\Filters;

final class WildcardPattern
{
    /**
     * Convierte un valor de filtro de texto en un patrón LIKE para Eloquent.
     *
     * Sin asterisco  → contiene:      "ba"    → "%ba%"
     * Asterisco final → empieza por:  "ba*"   → "ba%"
     * Asterisco inicio → termina en:  "*ba"   → "%ba"
     * Mixto:                          "ba*na"  → "ba%na"
     *
     * Los metacaracteres SQL (%, _, \) se escapan ANTES de interpretar el *.
     */
    public static function toLike(?string $value): string
    {
        if ($value === null || $value === '') {
            return '%%';
        }

        $escaped = str_replace(
            ['\\', '%', '_'],
            ['\\\\', '\\%', '\\_'],
            $value
        );

        if (!str_contains($value, '*')) {
            return '%' . $escaped . '%';
        }

        return str_replace('*', '%', $escaped);
    }
}
