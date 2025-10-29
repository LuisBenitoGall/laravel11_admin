<?php

namespace App\Support;

final class Iban{
    /**
     * Construye un IBAN normalizado (sin espacios, en mayúsculas)
     * a partir de los trozos españoles: entity(4), office(4), dc(2), digits(10).
     * Devuelve null si faltan trozos obligatorios o no cumplen longitud.
     */
    public static function fromEsParts(?string $entity, ?string $office, ?string $dc, ?string $digits): ?string{
        $entity = self::digitsOnly($entity);
        $office = self::digitsOnly($office);
        $dc     = self::digitsOnly($dc);
        $digits = self::digitsOnly($digits);

        if (!self::len($entity,4) || !self::len($office,4) || !self::len($dc,2) || !self::len($digits,10)) {
            return null;
        }

        $bban  = $entity.$office.$dc.$digits; // 20 dígitos
        $check = self::computeCheckDigits('ES', $bban);
        return 'ES'.$check.$bban;
    }

    /**
     * Construye IBAN para un país dado usando su BBAN ya ensamblado.
     * Útil si mañana soportas otros países con su propio BBAN.
     */
    public static function fromCountryAndBban(string $countryCode, string $bban): string{
        $country = strtoupper(preg_replace('/[^A-Z]/', '', $countryCode));
        $bban    = strtoupper(preg_replace('/\s+/', '', $bban));
        $check   = self::computeCheckDigits($country, $bban);
        return $country.$check.$bban;
    }

    /**
     * Devuelve IBAN sin espacios y en mayúsculas.
     */
    public static function normalize(?string $iban): ?string{
        if ($iban === null) return null;
        $iban = strtoupper(preg_replace('/\s+/', '', $iban));
        return $iban !== '' ? $iban : null;
    }

    // Valida formato básico + mod-97; no valida plantillas BBAN por país
    public static function isValid(?string $iban): bool{
        $iban = self::normalize($iban);
        if (!$iban || strlen($iban) < 15 || strlen($iban) > 34) {
            return false;
        }
        // Debe empezar con 2 letras y 2 dígitos
        if (!preg_match('/^[A-Z]{2}\d{2}[A-Z0-9]+$/', $iban)) {
            return false;
        }
        // Reordena y aplica mod-97
        $rearranged = substr($iban, 4).substr($iban, 0, 4);
        return self::mod97(self::toNumeric($rearranged)) === 1;
    }

    /**
     * IBAN bonito para mostrar: agrupa en bloques de 4.
     */
    public static function pretty(string $iban): string{
        $iban = self::normalize($iban) ?? '';
        return trim(implode(' ', str_split($iban, 4)));
    }

    /**
     * Cálculo estándar de dígitos de control IBAN (ISO 13616 / mod 97).
     * 1) Reordena: BBAN + Country + "00"
     * 2) Sustituye letras por números A=10..Z=35
     * 3) check = 98 - (numero % 97)
     */
    public static function computeCheckDigits(string $countryCode, string $bban): string{
        $rearranged = $bban.strtoupper($countryCode).'00';
        $numeric = self::toNumeric($rearranged);
        $mod = self::mod97($numeric);
        $check = 98 - $mod;
        return str_pad((string)$check, 2, '0', STR_PAD_LEFT);
    }

    // ----------------- helpers privados -----------------

    private static function digitsOnly(?string $s): string
    {
        return preg_replace('/\D+/', '', (string)$s);
    }

    private static function len(string $s, int $len): bool
    {
        return strlen($s) === $len;
    }

    /**
     * Convierte cadena con letras a números según IBAN: A=10..Z=35
     */
    private static function toNumeric(string $s): string
    {
        $s = strtoupper($s);
        $out = '';
        $len = strlen($s);
        for ($i = 0; $i < $len; $i++) {
            $ch = $s[$i];
            if ($ch >= 'A' && $ch <= 'Z') {
                $out .= (string)(ord($ch) - 55); // A=65 -> 10
            } elseif ($ch >= '0' && $ch <= '9') {
                $out .= $ch;
            }
            // otros caracteres se ignoran silenciosamente
        }
        return $out;
    }

    /**
     * Mod 97 para números largos representados como string.
     */
    private static function mod97(string $numeric): int
    {
        $remainder = 0;
        $len = strlen($numeric);
        $chunk = '';
        for ($i = 0; $i < $len; $i++) {
            $chunk .= $numeric[$i];
            // Reducimos cada cierto tamaño para no desbordar
            if (strlen($chunk) > 9) {
                $remainder = (int)($chunk % 97);
                $chunk = (string)$remainder;
            }
        }
        if ($chunk !== '') {
            $remainder = (int)($chunk % 97);
        }
        return $remainder;
    }
}
