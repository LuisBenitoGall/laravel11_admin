<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class BankResource extends JsonResource{
    /**
     * 1. Array bancos.
     */

    /**
     * 1. Array bancos.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tradename' => $this->tradename,
            'swift' => $this->swift,
            'lei' => $this->lei,
            'eu_code' => $this->eu_code,
            'supervisor_code' => $this->supervisor_code,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
