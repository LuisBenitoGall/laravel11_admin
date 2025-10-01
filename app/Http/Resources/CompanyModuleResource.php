<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class CompanyModuleResource extends JsonResource{
    /**
     * 1. Array módulos.
     */
    
    use LocaleTrait;

    /**
     * 1. Array módulos.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'label' => __($this->label),
            'color' => $this->color,
            'icon' => $this->icon,
            'level' => $this->level,
            'explanation' => $this->explanation,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at, 
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
