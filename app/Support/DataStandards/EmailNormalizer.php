<?php

namespace App\Support\DataStandards;

class EmailNormalizer
{
    /**
     * Trim, colapsar espacios, quitar control chars, minúsculas. Vacío → null.
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

        return mb_strtolower($v, 'UTF-8');
    }
}
