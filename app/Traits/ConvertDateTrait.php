<?php

namespace App\Traits;

use Carbon\Carbon;

trait ConvertDateTrait{
    /**
     * 1. Conversión de fecha a formato inglés.
     */

    /**
     * 1. Conversión de fecha a formato inglés.
     *
     * Convierte una fecha en formato local (d/m/Y o d/m/Y H:i:s)
     * o en formato ISO (Y-m-d\TH:i:s.u\Z) a 'Y-m-d' o 'Y-m-d H:i:s'.
     *
     * @param  string|null  $fecha  Cadena de fecha
     * @param  bool         $withTime  Si debe devolver también la hora
     * @return string|null
     */
    public function convertDate(?string $fecha, bool $withTime = false): ?string{
        if (! $fecha) {
            return null;
        }

        // 1) Formato ISO: 2025-05-25T22:00:00.000Z
        if (preg_match('/^\d{4}-\d{2}-\d{2}T/', $fecha)) {
            $dt = Carbon::parse($fecha);
        }
        // 2) Formato local corto: 25/05/2025
        elseif (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $fecha)) {
            $dt = Carbon::createFromFormat('d/m/Y', $fecha);
        }
        // 3) Formato local con hora: 25/05/2025 14:30:00
        elseif (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/', $fecha)) {
            $dt = Carbon::createFromFormat('d/m/Y H:i:s', $fecha);
        }
        else {
            // Intentamos parser genérico de Carbon
            try {
                $dt = Carbon::parse($fecha);
            } catch (\Exception $e) {
                return null;
            }
        }

        return $withTime
            ? $dt->format('Y-m-d H:i:s')
            : $dt->format('Y-m-d');
    }
}
