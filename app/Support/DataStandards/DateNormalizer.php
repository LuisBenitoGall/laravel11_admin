<?php

namespace App\Support\DataStandards;

use Carbon\Carbon;

class DateNormalizer
{
    /**
     * Parsea Y-m-d, d/m/Y, d-m-Y. Persistible Y-m-d o null.
     */
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $v = TextCleanupNormalizer::normalize($value);
        if ($v === '') {
            return null;
        }

        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y'] as $format) {
            try {
                $dt = Carbon::createFromFormat($format, $v);
                if ($dt !== false && $dt->format($format) === $v) {
                    return $dt->format('Y-m-d');
                }
            } catch (\Throwable) {
                // try next
            }
        }

        try {
            $dt = Carbon::parse($v);
            if ($dt !== false) {
                return $dt->format('Y-m-d');
            }
        } catch (\Throwable) {
            return null;
        }

        return null;
    }
}
