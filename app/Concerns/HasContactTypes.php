<?php

namespace App\Concerns;

trait HasContactTypes
{
    // Listado de tipos de contacto
    public static function typesMap(): array{
        return [
            'ayu'       => __('ayuntamiento'),
            'bco'       => __('banco'),
            'cl'        => __('cliente'),
            'clp'       => __('cliente_potencial'),
            'colb'      => __('colaborador'),
            'ca'        => __('comunidad_autonoma'),
            'cof'       => __('cofradia'),
            'conf'      => __('conferencias'),
            'edu'       => __('educacion'),
            'emp'       => __('empresa'),
            'ffaa'      => __('fuerzas_armadas'),
            'fund'      => __('fundacion'),
            'igl'       => __('iglesia'),
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
