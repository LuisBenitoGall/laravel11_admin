<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon; 

//Traits:
use App\Traits\LocaleTrait;

class UserResource extends JsonResource{
    /**
     * 1. Array usuarios.
     */
    
    use LocaleTrait;

    /**
     * 1. Array usuarios.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        return [
            'id' => $this->id,
            'name' => ucwords($this->name).' '.ucwords($this->surname),
            'surname' => $this->surname,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'birthday' => $this->birthday,
            'nif' => $this->nif,
            'signature' => $this->signature,
            'isAdmin' => $this->isAdmin,
            'featured_image' => $this->avatar && $this->avatar->image 
            ? \Storage::url('users/'.$this->avatar->image)
            : null,
            'phones' => $this->phones->pluck('phone_number')->implode(', '),
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->pluck('name')->toArray();
            }),
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])           
        ];
    }
}
