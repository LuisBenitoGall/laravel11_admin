<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class WorkplaceResource extends JsonResource{
    /**
     * 1. Array centros de trabajo.
     */

    use LocaleTrait;

    /**
     * 1. Array centros de trabajo.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo' => $this->logo,
            'logo_url' => $this->logo? \Storage::url('workplaces/'.$this->logo): null,
            'address' => $this->address,
            'cp' => $this->cp,
            'town_id' => $this->town_id,
            'town' => $this->town? $this->town->name.' ('.$this->town->province->name.')':'',
            'nif' => $this->nif,
            'website' => $this->website,
            'description' => $this->description,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
