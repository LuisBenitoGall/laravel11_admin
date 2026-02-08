<?php

namespace App\Support;

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
        if ($value === null || $value === '') {
            return '';
        }
        $v = trim((string) $value);
        $v = preg_replace('/[\r\n\t]+/', ' ', $v);
        $v = preg_replace('/\s+/', ' ', $v);
        if ($lowercase) {
            $v = mb_strtolower($v, 'UTF-8');
        }
        return trim($v);
    }

    /**
     * Normaliza un email (trim + minúsculas).
     */
    public static function normalizeEmail(?string $value): string
    {
        return self::normalize($value, true);
    }

    /**
     * Aplica normalización a un array asociativo de valores (por clave).
     * Las claves que contienen 'email' se pasan por normalizeEmail; el resto por normalize.
     */
    public static function normalizeRow(array $row): array
    {
        $out = [];
        foreach ($row as $key => $value) {
            $str = is_scalar($value) ? (string) $value : '';
            if (stripos($key, 'email') !== false) {
                $out[$key] = self::normalizeEmail($str);
            } else {
                $out[$key] = self::normalize($str, false);
            }
        }
        return $out;
    }
}
