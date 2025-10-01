<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class ModuleResource extends JsonResource{
    /**
     * 1. Array módulos.
     */
    
    use LocaleTrait;
    use ModulesTrait;

    /**
     * 1. Array módulos.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Niveles:
        $levels = $this->levels();
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'label' => __($this->label),
            'color' => '<span class="spot" style="background-color: '.$this->color.';" title="'.$this->color.'"></span>',
            'icon' => '<i class="la la-'.$this->icon.'"></i>',
            'level' => $levels[$this->level] ?? '',
            'translations' => $this->translations,
            'explanation' => $this->explanation,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at, 
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
