<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon; 

//Concerns:
use App\Concerns\HasSalutation;

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

        $salutation = $this->salutation? HasSalutation::salutationAbbrOf($this->salutation):'';

        return [
            'id' => $this->id,
            'name' => $salutation.' '.ucwords($this->name).' '.ucwords($this->surname),
            'surname' => $this->surname,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'birthday' => $this->birthday,
            'nif' => $this->nif,
            'signature' => $this->signature,
            'isAdmin' => $this->isAdmin,
            'avatar' => $this->avatar && $this->avatar->image 
            ? \Storage::url('users/'.$this->avatar->image)
            : null,
            //'phones' => $this->phones->pluck('phone_number')->implode(', '),
            'phones_count'  => $this->phones->count(),
            'phones'        => $this->phones->map(fn($p) => [
                'e164'        => $p->e164,
                'type'        => $p->type,
                'label'       => $p->label,
                'is_primary'  => $p->is_primary,
                'is_whatsapp' => $p->is_whatsapp,
            ])->values(),
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
