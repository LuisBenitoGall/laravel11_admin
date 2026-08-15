<?php

namespace App\Support\DataStandards;

class NifNormalizer
{
    /**
     * Quitar espacios y guiones, mayúsculas. Vacío → null.
     */
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $v = TextCleanupNormalizer::normalize($value);
        if ($v === '') {
            return null;
        }

        $v = preg_replace('/[\s\-]+/u', '', $v) ?? '';
        if ($v === '') {
            return null;
        }

        return mb_strtoupper($v, 'UTF-8');
    }
}
