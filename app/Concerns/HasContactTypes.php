<?php

namespace App\Concerns;

trait HasContactTypes
{
    // Listado de tipos de contacto
    public static function typesMap(): array{
        return [
            'cl'        => __('cliente'),
            'clp'       => __('cliente_potencial'),
            'colb'      => __('colaborador'),
            'conf'      => __('conferencias'),
            'inst'      => __('institucional'),
            'gbco'      => __('gabinete_comunicacion'),
            'mdco'      => __('medio_comunicacion'),
            'newl'      => __('newsletter'),
            'otrc'      => __('contactos_otros'),
            'patr'      => __('patronato'),
            'pr'        => __('proveedor'),
            'arti'      => __('artista')
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
