<?php

namespace App\Concerns;

//Models:
use App\Models\Product;

trait HasProducts{
	/**
	 * 1. Estados de producción para productos.
	 */
	public static function productionProductStatus($status = false){
        $data = [
            1 => __('materia_prima'),
            10 => __('semielaborado'),
            40 => __('producto_acabado')
        ];

        return $status && isset($data[$status])
            ? ucfirst($data[$status])
            : $data;
    }

}