<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class MarketingCampaignResource extends JsonResource
{
    /**
     * 1. Array campañas.
     */

    /**
     * 1. Array campañas.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->campaign_code,
            'type' => $this->campaign_type,
            'status' => $this->status,
            'is_quick' => $this->quick == 1? true:false,
            'start_at' => $this->start_at ? Carbon::parse($this->start_at)->format($locale[4]):'',
            'finish_at' => $this->finish_at ? Carbon::parse($this->finish_at)->format($locale[4]):'',
            'created_by' => new UserResource($this->createdBy),
            'updated_by' => new UserResource($this->updatedBy),
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
