<?php

namespace App\Support\DataStandards;

class PersonNameNormalizer
{
    /** @var list<string> */
    private const PARTICLES = [
        'de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'di', 'van', 'von',
    ];

    /**
     * Title Case UTF-8 con partículas, Mc/O' y siglas 2–3 letras.
     */
    public static function normalize(?string $value): string
    {
        $v = TextCleanupNormalizer::normalize($value);
        if ($v === '') {
            return '';
        }

        $sourceAllCaps = $v === mb_strtoupper($v, 'UTF-8');
        $tokens = preg_split('/\s+/u', $v) ?: [];
        $out = [];

        foreach ($tokens as $i => $token) {
            if ($token === '') {
                continue;
            }

            $len = mb_strlen($token, 'UTF-8');
            $upper = mb_strtoupper($token, 'UTF-8');
            $lower = mb_strtolower($token, 'UTF-8');

            // Partícula (no primer token)
            if ($i > 0 && in_array($lower, self::PARTICLES, true)) {
                $out[] = $lower;
                continue;
            }

            // Sigla 2–3 letras ya en MAYÚSCULAS (solo si el valor no venía todo en mayúsculas)
            if (
                ! $sourceAllCaps
                && $len >= 2
                && $len <= 3
                && $token === $upper
                && preg_match('/^[\p{L}]+$/u', $token)
            ) {
                $out[] = $token;
                continue;
            }

            // Mc...
            if (preg_match('/^(mc)(.+)$/iu', $token, $m)) {
                $out[] = 'Mc'.self::titleCaseRest($m[2]);
                continue;
            }

            // O'...
            if (preg_match("/^(o')(.+)$/iu", $token, $m)) {
                $out[] = "O'".self::titleCaseRest($m[2]);
                continue;
            }

            $out[] = self::titleCaseRest($token);
        }

        return implode(' ', $out);
    }

    private static function titleCaseRest(string $word): string
    {
        $lower = mb_strtolower($word, 'UTF-8');
        $first = mb_strtoupper(mb_substr($lower, 0, 1, 'UTF-8'), 'UTF-8');

        return $first.mb_substr($lower, 1, null, 'UTF-8');
    }
}
