<?php

namespace App\Traits;

trait LocaleTrait{
    /**
     * 1. Opciones de idiomas. 
     * 2. Idiomas soportados.
     */
    
    /**
     *  1. Opciones de idiomas.
     * @param  string|null $lang [description]
     * @return [type]            [description]
     */
    public static function languages(string $lang = null){
        $languages = [
            /*
             * Key es el código de idioma en Laravel
             * [0] => Código de idioma para Carbon
             * [1] => Código de idioma para setlocale()
             * [2] => Es RTL (true o false)
             * [3] => Nombre del idioma
             * [4] => Formato de fecha
             * [5] => Estado (activo o inactivo)
             * [6] => Formato de fecha para DatePicker
             */

            'es' => ['es', 'es_ES', false, 'Castellano', 'd/m/Y', true, 'dd/MM/yyyy'],
            'ca' => ['ca', 'ca_CA', false, 'Català', 'd/m/Y', true, 'dd/MM/yyyy'],
            'en' => ['en', 'en_US', false, 'English', 'Y/m/d', true, 'yyyy/MM/dd'],
        ];

        return $lang ? ($languages[$lang] ?? null) : $languages;
    }

    /**
     * 2. Idiomas soportados.
     */
    public static function availableLocales() {
        return ['es', 'ca', 'en']; 
    }
}
