<?php

namespace App\Support\DataStandards;

class AccountNameNormalizer
{
    /**
     * Trim y colapsar whitespace; no cambia casing.
     */
    public static function normalize(?string $value): string
    {
        return TextCleanupNormalizer::normalize($value);
    }
}
