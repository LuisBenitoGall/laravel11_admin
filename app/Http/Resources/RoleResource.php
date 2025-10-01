<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon; 

//Traits:
use App\Traits\LocaleTrait;

class RoleResource extends JsonResource{
	/**
     * 1. Array roles.
     * 2. Formateo campo name.
     */
    
    use LocaleTrait;
    
    /**
     * 1. Array roles.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        return [
            'id' => $this->id,
            'name' => ucfirst($this->formatName($this->name)),
            'guard_name' => $this->guard_name,
            'description' => $this->description,
            'company_id' => $this->company_id,
            'universal' => $this->universal? true:false,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }

    /**
     * 2. Formateo campo name.
     */
    private function formatName(string $name): string{
        return preg_replace('/^.*\//', '', $name);
    }
}