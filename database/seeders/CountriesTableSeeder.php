<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//Models:
use App\Models\Country;

class CountriesTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(){
        $data = [
    		['name' => 'España',
        	'slug' => 'espana'],
        	['name' => 'Francia',
        	'slug' => 'francia'],
            ['name' => 'Italia',
        	'slug' => 'italia']
    	];

    	foreach ($data as $key => $value){
        	Country::create($value);
        }
    }
}
