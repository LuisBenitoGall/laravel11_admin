<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class CustomerProviderResource extends JsonResource{
    /**
     * 1. Array empresas.
     */

    use LocaleTrait;

    /**
     * 1. Array empresas.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        return [
            // relation_id proviene del JOIN en las consultas (customer_providers.id AS relation_id)
            'relation_id' => $this->relation_id ?? null,
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tradename' => $this->tradename,
            'acronym' => $this->acronym,
            'logo' => $this->logo,
            'logo_url' => $this->logo? Storage::url('companies/'.$this->logo): null,
            'nif' => $this->nif,
            'is_ute' => $this->is_ute? true:false,
            'status' => $this->status,
            'created_by' => new UserResource($this->createdBy),
            'updated_by' => new UserResource($this->updatedBy),
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
