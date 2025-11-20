<?php

namespace App\Concerns;

trait HasRelevanceLevels
{
    /**
     * Opciones de relevancia del 1 al 5, con color asociado.
     * Pensado para ser enviado también al frontend (Inertia).
     */
    public static function relevanceOptions(): array
    {
        return [
            1 => [
                'value' => 1,
                'key'   => 'low',
                'label' => __('baja'),
                'color' => '#0d6efd', // azul
            ],
            2 => [
                'value' => 2,
                'key'   => 'medium_low',
                'label' => __('media_baja'),
                'color' => '#0dcaf0', // azul claro / cian
            ],
            3 => [
                'value' => 3,
                'key'   => 'medium',
                'label' => __('media'),
                'color' => '#ffc107', // amarillo
            ],
            4 => [
                'value' => 4,
                'key'   => 'medium_high',
                'label' => __('media_alta'),
                'color' => '#fd7e14', // naranja
            ],
            5 => [
                'value' => 5,
                'key'   => 'high',
                'label' => __('alta'),
                'color' => '#dc3545', // rojo ardiente
            ],
        ];
    }

    public static function relevanceOption(int $value): ?array
    {
        $options = static::relevanceOptions();

        return $options[$value] ?? null;
    }

    public static function relevanceLabel(int $value): ?string
    {
        $option = static::relevanceOption($value);

        return $option['label'] ?? null;
    }
}
