<?php

namespace App\Traits;

trait ModulesTrait{
    /**
     * 1. Niveles de módulo.
     */
    
    /**
     * 1. Niveles de módulo.
     */
    public static function levels($level = false){
        $data = [
            1 => __('modulos_administrador'),
            2 => __('modulos_basicos'),
            3 => __('modulos_optativos')
        ];

        if($level){
            return $data[$level];
        }else{
            return $data;
        }
    }
}
