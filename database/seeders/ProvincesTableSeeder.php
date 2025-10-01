<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//Models:
use App\Models\Province;

class ProvincesTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(){
        $data = [
			['name' => 'ÁLAVA', 'slug' => 'alava', 'country_id' => 1],
			['name' => 'ALBACETE', 'slug' => 'albacete', 'country_id' => 1],
			['name' => 'ALICANTE', 'slug' => 'alicante', 'country_id' => 1],
			['name' => 'ALMERÍA', 'slug' => 'almeria', 'country_id' => 1],
			['name' => 'ÁVILA', 'slug' => 'avila', 'country_id' => 1],
			['name' => 'BADAJOZ', 'slug' => 'badajoz', 'country_id' => 1],
			['name' => 'BALEARES', 'slug' => 'baleares', 'country_id' => 1],
			['name' => 'BARCELONA', 'slug' => 'barcelona', 'country_id' => 1],
			['name' => 'BURGOS', 'slug' => 'burgos', 'country_id' => 1],
			['name' => 'CÁCERES', 'slug' => 'caceres', 'country_id' => 1],
			['name' => 'CÁDIZ', 'slug' => 'cadiz', 'country_id' => 1],
			['name' => 'CASTELLÓN', 'slug' => 'castellon', 'country_id' => 1],
			['name' => 'CIUDAD REAL', 'slug' => 'ciudad-real', 'country_id' => 1],
			['name' => 'CÓRDOBA', 'slug' => 'cordoba', 'country_id' => 1],
			['name' => 'A CORUÑA', 'slug' => 'a-coruna', 'country_id' => 1],
			['name' => 'CUENCA', 'slug' => 'cuenca', 'country_id' => 1],
			['name' => 'GIRONA', 'slug' => 'girona', 'country_id' => 1],
			['name' => 'GRANADA', 'slug' => 'granada', 'country_id' => 1],
			['name' => 'GUADALAJARA', 'slug' => 'guadalajara', 'country_id' => 1],
			['name' => 'GUIPUZCOA', 'slug' => 'guipuzcoa', 'country_id' => 1],
			['name' => 'HUELVA', 'slug' => 'huelva', 'country_id' => 1],
			['name' => 'HUESCA', 'slug' => 'huesca', 'country_id' => 1],
			['name' => 'JAEN', 'slug' => 'jaen', 'country_id' => 1],
			['name' => 'LEÓN', 'slug' => 'leon', 'country_id' => 1],
			['name' => 'LLEIDA', 'slug' => 'lleida', 'country_id' => 1],
			['name' => 'LA RIOJA', 'slug' => 'la-rioja', 'country_id' => 1],
			['name' => 'LUGO', 'slug' => 'lugo', 'country_id' => 1],
			['name' => 'MADRID', 'slug' => 'madrid', 'country_id' => 1],
			['name' => 'MÁLAGA', 'slug' => 'malaga', 'country_id' => 1],
			['name' => 'MURCIA', 'slug' => 'murcia', 'country_id' => 1],
			['name' => 'NAVARRA', 'slug' => 'navarra', 'country_id' => 1],
			['name' => 'OURENSE', 'slug' => 'ourense', 'country_id' => 1],
			['name' => 'ASTURIAS', 'slug' => 'asturias', 'country_id' => 1],
			['name' => 'PALENCIA', 'slug' => 'palencia', 'country_id' => 1],
			['name' => 'LAS PALMAS', 'slug' => 'las-palmas', 'country_id' => 1],
			['name' => 'PONTEVEDRA', 'slug' => 'pontevedra', 'country_id' => 1],
			['name' => 'SALAMANCA', 'slug' => 'salamanca', 'country_id' => 1],
			['name' => 'TENERIFE', 'slug' => 'tenerife', 'country_id' => 1],
			['name' => 'CANTABRIA', 'slug' => 'cantabria', 'country_id' => 1],
			['name' => 'SEGOVIA', 'slug' => 'segovia', 'country_id' => 1],
			['name' => 'SEVILLA', 'slug' => 'sevilla', 'country_id' => 1],
			['name' => 'SORIA', 'slug' => 'soria', 'country_id' => 1],
			['name' => 'TARRAGONA', 'slug' => 'tarragona', 'country_id' => 1],
			['name' => 'TERUEL', 'slug' => 'teruel', 'country_id' => 1],
			['name' => 'TOLEDO', 'slug' => 'toledo', 'country_id' => 1],
			['name' => 'VALENCIA', 'slug' => 'valencia', 'country_id' => 1],
			['name' => 'VALLADOLID', 'slug' => 'valladolid', 'country_id' => 1],
			['name' => 'VIZCAYA', 'slug' => 'vizcaya', 'country_id' => 1],
			['name' => 'ZAMORA', 'slug' => 'zamora', 'country_id' => 1],
			['name' => 'ZARAGOZA', 'slug' => 'zaragoza', 'country_id' => 1],
			['name' => 'CEUTA', 'slug' => 'ceuta', 'country_id' => 1],
			['name' => 'MELILLA', 'slug' => 'melilla', 'country_id' => 1]
    	];

    	foreach($data as $key => $value){
            Province::create($value);
        }
    }
}
