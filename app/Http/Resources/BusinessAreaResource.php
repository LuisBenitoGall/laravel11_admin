<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

// Traits
use App\Traits\LocaleTrait;

class BusinessAreaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->format($locale[4]) : null,
            'updated_at' => $this->updated_at ? Carbon::parse($this->updated_at)->format($locale[4]) : null,
        ];
    }
}
