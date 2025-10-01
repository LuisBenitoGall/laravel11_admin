<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon; 

//Traits:
use App\Traits\LocaleTrait;

class PermissionResource extends JsonResource{
    /**
     * 1. Array permissions.
     */
    
    use LocaleTrait;

    /**
     * 1. Array permissions.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Funcionalidad:
        $p = explode('.', $this->name);
        $prefixe = isset($p[1])? ucfirst(__($p[1])):'';
        $functionality = $prefixe.' '.strtolower($p[0]);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'functionality' => $functionality,
            'guard_name' => $this->guard_name,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
