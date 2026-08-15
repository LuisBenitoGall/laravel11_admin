<?php

namespace App\Support\DataStandards;

class TextCleanupNormalizer
{
    /**
     * Trim, colapsar whitespace y quitar caracteres de control.
     */
    public static function normalize(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        $v = (string) $value;
        $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
        $v = preg_replace('/[\r\n\t]+/u', ' ', $v) ?? '';
        $v = preg_replace('/\s+/u', ' ', $v) ?? '';

        return trim($v);
    }
}
