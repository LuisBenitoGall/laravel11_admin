<?php

namespace App\Support;

use App\Support\DataStandards\AccountNameNormalizer;
use App\Support\DataStandards\EmailNormalizer;
use App\Support\DataStandards\NifNormalizer;
use App\Support\DataStandards\PersonNameNormalizer;
use App\Support\DataStandards\TextCleanupNormalizer;

class ImportContactRowNormalizer
{
    /**
     * Normaliza un valor de celda para importación de contactos.
     * - Trim de espacios.
     * - Para emails: minúsculas.
     * - Elimina caracteres conflictivos (saltos de línea, tabuladores dentro del valor).
     */
    public static function normalize(?string $value, bool $lowercase = false): string
    {
        $v = TextCleanupNormalizer::normalize($value);
        if ($v === '') {
            return '';
        }
        if ($lowercase) {
            return mb_strtolower($v, 'UTF-8');
        }

        return $v;
    }

    /**
     * Normaliza un email (trim + minúsculas).
     */
    public static function normalizeEmail(?string $value): string
    {
        return EmailNormalizer::normalize($value) ?? '';
    }

    /**
     * Aplica normalización a un array asociativo de valores (por clave).
     */
    public static function normalizeRow(array $row): array
    {
        $out = [];
        foreach ($row as $key => $value) {
            $str = is_scalar($value) ? (string) $value : '';
            if (stripos($key, 'email') !== false) {
                $out[$key] = self::normalizeEmail($str);
            } elseif (in_array($key, ['user_nif', 'company_nif'], true)) {
                $out[$key] = NifNormalizer::normalize($str) ?? '';
            } elseif (in_array($key, ['name', 'surname'], true)) {
                $out[$key] = PersonNameNormalizer::normalize($str);
            } elseif ($key === 'company') {
                $out[$key] = AccountNameNormalizer::normalize($str);
            } else {
                $out[$key] = TextCleanupNormalizer::normalize($str);
            }
        }

        return $out;
    }
}
