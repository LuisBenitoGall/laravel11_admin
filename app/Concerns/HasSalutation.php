<?php

namespace App\Concerns;

trait HasSalutation{
    // Devuelve todo el mapa desde config
    public static function salutationMap(): array{
        return [
            // clave => [label, abbr]
            'sr'        => ['label' => __('senor'),                         'abbr' => 'Sr.'],
            'sra'       => ['label' => __('senora'),                        'abbr' => 'Sra.'],
            'srta'      => ['label' => __('senorita'),                      'abbr' => 'Srta.'],
            'don'       => ['label' => __('don'),                           'abbr' => 'D.'],
            'dona'      => ['label' => __('dona'),                          'abbr' => 'D.ª'],
            'dr'        => ['label' => __('doctor'),                        'abbr' => 'Dr.'],
            'dra'       => ['label' => __('doctora'),                       'abbr' => 'Dra.'],
            'prof'      => ['label' => __('profesor'),                      'abbr' => 'Prof.'],
            'profa'     => ['label' => __('profesora'),                     'abbr' => 'Profa.'],
            'lic'       => ['label' => __('licenciado'),                    'abbr' => 'Lic.'],
            'lda'       => ['label' => __('licenciada'),                    'abbr' => 'Lda.'],
            'mr'        => ['label' => __('mister'),                        'abbr' => 'Mr.'],
            'ms'        => ['label' => __('miss'),                          'abbr' => 'Ms.'],
            'mrs'       => ['label' => __('miss'),                          'abbr' => 'Mrs.'],
            'rvdo'      => ['label' => __('reverendo'),                     'abbr' => 'Rvdo'],
            'estsr'     => ['label' => __('estimado_senor'),                'abbr' => 'Estimado Sr.'],
            'estsra'    => ['label' => __('estimada_senora'),               'abbr' => 'Estimada Sra.'],
            'estsres'   => ['label' => __('estimados_senores'),             'abbr' => 'Estimados Sres.'],
            'ilus'      => ['label' => __('ilustrisimo_senor'),             'abbr' => 'Ilmo. Sr.'],
            'ilusa'     => ['label' => __('ilustrisima_senora'),            'abbr' => 'Ilma. Sra.'],
            'exc'       => ['label' => __('excelencia'),                    'abbr' => 'Exc.'],
            'excsr'     => ['label' => __('excelentisimo_senor'),           'abbr' => 'Excmo. Sr.'],
            'excsra'    => ['label' => __('excelentisima_senora'),          'abbr' => 'Excma. Sra.'],
            'snria'     => ['label' => __('senoria'),                       'abbr' => 'S.ª'],
            'rector'    => ['label' => __('rector_magnifico'),              'abbr' => 'Excmo. Sr. Rector Magnífico'],
            'santsd'    => ['label' => __('su_santidad'),                   'abbr' => 'S.S.'],
            'emrvdo'    => ['label' => __('eminentisimo_reverendisimo'),    'abbr' => 'Emmo. y Rvmo.'],
            'exrvdo'    => ['label' => __('excelentisimo_reverendisimo'),   'abbr' => 'Excmo. y Rvmo.'],
            'ilrvdo'    => ['label' => __('ilustrisimo_reverendisimo'),     'abbr' => 'Ilmo. y Rvmo.'],
            'muyil'     => ['label' => __('muy_ilustre'),                   'abbr' => 'M.I.'],
            'rvdopdr'   => ['label' => __('reverendisimo_padre'),           'abbr' => 'Rvmo. Sr. y Rvmo. P.'],
            'eminencia' => ['label' => __('su_eminencia'),                  'abbr' => 'S.E.']
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
