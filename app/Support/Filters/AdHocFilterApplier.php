<?php

namespace App\Support\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use ReflectionFunction;

class AdHocFilterApplier
{
    /**
     * @param  array<string, array{rules?: array, apply: callable}>  $definitions
     */
    public static function apply(Builder $query, Request $request, array $definitions): Builder
    {
        $input = $request->input('adhoc', []);

        if (!is_array($input) || empty($definitions)) {
            return $query;
        }

        // Whitelist: sólo keys permitidas
        $input = array_intersect_key($input, $definitions);

        // 1) Validación
        $rules = ['adhoc' => ['array']];

        foreach ($definitions as $key => $def) {
            if (isset($def['rules']) && is_array($def['rules'])) {
                $rules["adhoc.$key"] = $def['rules'];
            } else {
                $rules["adhoc.$key"] = ['nullable'];
            }
        }

        try {
            Validator::make(['adhoc' => $input], $rules)->validate();
        } catch (ValidationException $e) {
            throw $e;
        }

        // 2) Aplicación
        foreach ($input as $key => $value) {
            if (self::isBlank($value)) {
                continue;
            }

            $apply = $definitions[$key]['apply'] ?? null;
            if (!is_callable($apply)) {
                continue;
            }

            // Llamada segura:
            // - tus closures suelen ser fn(Builder $q, $v)
            // - si alguna vez quieres fn(Builder $q, $v, Request $request), también soportado
            $argsCount = self::callableArgsCount($apply);

            if ($argsCount >= 3) {
                $apply($query, $value, $request);
            } else {
                $apply($query, $value);
            }
        }

        return $query;
    }

    private static function callableArgsCount(callable $callable): int
    {
        // Closures / funciones
        if (is_object($callable) && method_exists($callable, '__invoke')) {
            $ref = new ReflectionFunction($callable);
            return $ref->getNumberOfParameters();
        }

        // ['Class','method'] o [$obj,'method']
        if (is_array($callable) && count($callable) === 2) {
            [$objOrClass, $method] = $callable;
            $ref = new \ReflectionMethod($objOrClass, $method);
            return $ref->getNumberOfParameters();
        }

        // 'function_name'
        if (is_string($callable) && function_exists($callable)) {
            $ref = new ReflectionFunction($callable);
            return $ref->getNumberOfParameters();
        }

        // fallback
        return 2;
    }

    private static function isBlank(mixed $value): bool
    {
        if ($value === null) return true;

        if (is_string($value)) {
            return trim($value) === '';
        }

        if (is_array($value)) {
            foreach ($value as $v) {
                if (!self::isBlank($v)) return false;
            }
            return true;
        }

        return false;
    }
}
