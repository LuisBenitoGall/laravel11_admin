<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class AccountResource extends JsonResource{
    /**
     * 1. Array cuentas.
     */
    
    use LocaleTrait;
    
    /**
     * 1. Array cuentas.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        return [
            'id' => $this->id,
            'name' => ucfirst($this->name),
            'slug' => $this->slug,
            'description' => __($this->description),
            'rate' => $this->rate.config('constants.CURRENCY_'),
            'duration' => $this->duration,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at, 
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
