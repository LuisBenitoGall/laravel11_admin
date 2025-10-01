<?php

namespace App\Traits;

trait HasSignStockMovementsTrait{
    /**
     * 1. Signo movimientos de stock.
     */

    /**
     * 1. Signo movimientos de stock.
     */
    public static function signStockMovements($sign = false){
        $data = [
            's' => __('sumar'),
            'r' => __('restar'),
            'x' => __('traspaso'),
            'y' => __('devolucion_interna')
        ];
        if($sign){
            return $data[$sign];
        }else{
            return $data;
        }
    }
}
