<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class MarketingListResource extends JsonResource
{
    /**
     * 1. Array listas.
     */

    /**
     * 1. Array listas.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->campaign_type,
            'status' => $this->status,
            'last_used_at' => $this->last_used_at ? Carbon::parse($this->last_used_at)->format($locale[4]):'',
            'created_by' => new UserResource($this->createdBy),
            'updated_by' => new UserResource($this->updatedBy),
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
