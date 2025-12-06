<?php

namespace App\Concerns;

trait HasBusinessTypes
{
    // Listado de tipos de negocio
    public static function typesMap(): array{
        return [
            1 => 'Alfombra',
            2 => 'Repostero',
            3 => 'Tapiz',
            4 => 'Otros textiles',
            5 => 'Textiles religiosos',
            6 => 'Mantillas y mantones de Manila',
            7 => 'Banderas'
        ];
    }

    public static function comboOptions(): array{
        $out = [];
        foreach (self::typesMap() as $k => $v) {
            $out[] = [
                'value' => $k,
                'label' => $v,
            ];
        }
        return $out;
    }

    /** Helpers estáticos por si te resultan útiles en controladores/recursos */
    public static function typesOf(?string $key): ?string{
        return $key && isset(self::typesMap()[$key])
            ? self::typesMap()[$key]
            : null;
    }
}
