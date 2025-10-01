<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Company; // Importar el modelo Company

class CompaniesTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     */
    public function run(): void{
        Company::factory(500)->create(); // Crear 500 registros usando el factory
    }
}
