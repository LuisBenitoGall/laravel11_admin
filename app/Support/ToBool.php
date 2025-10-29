<?php

namespace App\Support;

final class ToBool{
    /**
     * Convierte a boolean aceptando variantes típicas de formularios:
     * true/false, "true"/"false", "on"/"off", "yes"/"no", "1"/"0",
     * y versiones en español: "si"/"sí"/"no".
     */
    public static function cast($value, bool $default = false): bool{
        if ($value === null) return $default;
        if (is_bool($value)) return $value;

        if (is_int($value)) return $value === 1;
        if (is_float($value)) return (int)$value === 1;

        if (is_string($value)) {
            $v = trim(mb_strtolower($value));
            $truthy = ['1', 'true', 'on', 'yes', 'y', 'si', 'sí'];
            $falsy  = ['0', 'false', 'off', 'no', 'n'];

            if (in_array($v, $truthy, true)) return true;
            if (in_array($v, $falsy,  true)) return false;
        }

        // Último recurso: truthiness PHP
        return (bool) $value;
    }

    /**
     * Normaliza en bloque varias claves booleanas dentro de un array de datos.
     * Si la clave no existe, aplica el default.
     */
    public static function merge(array $data, array $keys, bool $default = false): array
    {
        foreach ($keys as $key) {
            $data[$key] = self::cast($data[$key] ?? null, $default);
        }
        return $data;
    }
}
