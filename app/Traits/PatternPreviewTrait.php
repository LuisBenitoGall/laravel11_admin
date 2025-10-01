<?php
namespace App\Traits;

trait PatternPreviewTrait{
    public function getPatternPreview($pattern)
    {
        $segments = is_string($pattern) ? json_decode($pattern, true) : $pattern;
        $year = date('Y');
        $yearShort = date('y');

        return collect($segments)->map(function ($seg) use ($year, $yearShort) {
            if ($seg['type'] === 'digits') {
                $ndigits = isset($seg['ndigits']) ? (int)$seg['ndigits'] : 1;
                return str_pad('1', $ndigits, '0', STR_PAD_LEFT);
            }
            if ($seg['type'] === 'text') return $seg['value'] ?? '';
            if ($seg['type'] === 'year') return ($seg['value'] ?? 'YYYY') === 'YY' ? $yearShort : $year;
            return '';
        })->implode('');
    }
}