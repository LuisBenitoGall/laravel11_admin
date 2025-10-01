<?php

namespace App\Traits;

trait AccountingAccountTypeTrait{
    /**
     * 1. Modos grupos contables.
     */
    
    /**
     * 1. Modos grupos contables.
     */
    public static function modes($mode = false){
        $data = [
            'a' => __('activos'),
            'p' => __('pasivos'),
            'g' => __('perdidas_ganancias')
        ];

        if($mode){
            return $data[$mode];
        }else{
            return $data;
        }       
    }
}
