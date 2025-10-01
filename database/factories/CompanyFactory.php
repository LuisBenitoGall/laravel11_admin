<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition()
    {
        return [
            'is_community' => $this->faker->boolean,
            'name' => $this->faker->company,
            'slug' => $this->faker->slug,
            'tradename' => $this->faker->companySuffix,
            'acronym' => $this->faker->word,
            'logo' => $this->faker->imageUrl(),
            'nif' => $this->faker->unique()->bothify('??###??'),
            'status' => $this->faker->numberBetween(0, 1),
            'created_by' => 1, // Cambia según tu lógica de usuarios
            'updated_by' => 1, // Cambia según tu lógica de usuarios
            'deleted_at' => null, // Para no usar soft deletes en este caso
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}