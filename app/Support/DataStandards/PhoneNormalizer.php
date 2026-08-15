<?php

namespace App\Support\DataStandards;

use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

class PhoneNormalizer
{
    /**
     * E.164 con región por defecto ES. No parseable → null.
     */
    public static function toE164OrNull(?string $raw, string $defaultRegion = 'ES'): ?string
    {
        if ($raw === null) {
            return null;
        }

        $cleaned = self::trimAllWhitespace($raw);
        if ($cleaned === '') {
            return null;
        }

        $util = PhoneNumberUtil::getInstance();

        try {
            $parsed = $util->parse($cleaned, $defaultRegion);
            if (! $util->isValidNumber($parsed)) {
                return null;
            }

            return $util->format($parsed, PhoneNumberFormat::E164);
        } catch (\Throwable) {
            return null;
        }
    }

    public static function trimAllWhitespace(string $value): string
    {
        $value = preg_replace('/\s+/u', '', $value) ?? '';

        return trim($value);
    }
}
