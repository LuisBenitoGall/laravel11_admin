<?php

namespace App\Concerns;

trait HasSalutation{
    // Devuelve todo el mapa desde config
    public static function salutationMap(): array{
        return [
            // clave => [label, abbr]
            'sr'        => ['label' => __('senor'),      'abbr' => 'Sr.'],
            'sra'       => ['label' => __('senora'),     'abbr' => 'Sra.'],
            'srta'      => ['label' => __('senorita'),   'abbr' => 'Srta.'],
            'don'       => ['label' => __('don'),        'abbr' => 'D.'],
            'dona'      => ['label' => __('dona'),       'abbr' => 'D.ª'],
            'dr'        => ['label' => __('doctor'),     'abbr' => 'Dr.'],
            'dra'       => ['label' => __('doctora'),    'abbr' => 'Dra.'],
            'prof'      => ['label' => __('profesor'),   'abbr' => 'Prof.'],
            'profa'     => ['label' => __('profesora'),  'abbr' => 'Profa.'],
            'lic'       => ['label' => __('licenciado'), 'abbr' => 'Lic.'],
            'lda'       => ['label' => __('licenciada'), 'abbr' => 'Lda.']
        ];
    }

    // Claves válidas (para selects/validación)
    public static function salutationKeys(): array{
        return array_keys(self::salutationMap());
    }

    // Etiqueta larga
    public function getSalutationLabelAttribute(): ?string{
        $key = $this->salutation;
        $map = self::salutationMap();
        return $key && isset($map[$key]) ? $map[$key]['label'] : null;
    }

    // Abreviatura
    public function getSalutationAbbrAttribute(): ?string{
        $key = $this->salutation;
        $map = self::salutationMap();
        return $key && isset($map[$key]) ? $map[$key]['abbr'] : null;
    }

    // Opciones preparadas para selects
    public static function salutationOptions(): array{
        $out = [];
        foreach (self::salutationMap() as $k => $v) {
            $out[$k] = trim(($v['abbr'] ?? '') . ' (' . ($v['label'] ?? '') . ')');
        }
        return $out;
    }

    public static function comboOptions(): array{
        $out = [];
        foreach (self::salutationMap() as $k => $v) {
            $abbr  = $v['abbr']  ?? '';
            $label = $v['label'] ?? '';
            $out[] = [
                'value' => $k,
                'label' => trim($abbr . ' (' . $label . ')'),
            ];
        }
        return $out;
    }

    /** Helpers estáticos por si te resultan útiles en controladores/recursos */
    public static function salutationAbbrOf(?string $key): ?string{
        return $key && isset(self::salutationMap()[$key])
            ? self::salutationMap()[$key]['abbr']
            : null;
    }

    public static function salutationLabelOf(?string $key): ?string{
        return $key && isset(self::salutationMap()[$key])
            ? self::salutationMap()[$key]['label']
            : null;
    }

    /**
     * Pares simples [key => "Abbr Label"] por si alguna vez lo necesitas.
     * Ej: ['sr' => 'Sr. Señor', ...]
     */
    public static function salutationPairsSimple(string $sep = ' '): array{
        $out = [];
        foreach (self::salutationMap() as $k => $v) {
            $abbr  = $v['abbr']  ?? '';
            $label = $v['label'] ?? '';
            $out[$k] = trim($abbr . ($abbr && $label ? $sep : '') . $label);
        }
        return $out;
    }
}
