<?php

namespace App\Support\DataStandards;

use Illuminate\Support\Str;

class SlugNormalizer
{
    public static function normalize(?string $value): string
    {
        $v = AccountNameNormalizer::normalize($value);
        if ($v === '') {
            return '';
        }

        return (string) Str::slug($v);
    }
}
