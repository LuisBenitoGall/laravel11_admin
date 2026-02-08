<?php

namespace App\Support;

/**
 * Normaliza cadenas para comparación (quitar acentos, minúsculas, trim).
 * Reutilizable en resolución de contact_type y business_type en importaciones.
 */
class ImportStringNormalizer
{
    public static function normalize(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }
        $value = trim($value);
        $value = mb_strtolower($value, 'UTF-8');
        $value = self::removeAccents($value);
        return $value;
    }

    public static function removeAccents(string $value): string
    {
        $map = [
            'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a', 'ã' => 'a', 'å' => 'a',
            'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e',
            'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o', 'õ' => 'o',
            'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u',
            'ñ' => 'n', 'ç' => 'c',
        ];
        return strtr($value, $map);
    }
}
