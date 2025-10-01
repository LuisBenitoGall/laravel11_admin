<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;
use App\Traits\PatternPreviewTrait;

class ProductPatternResource extends JsonResource{
    /**
     * 1. Array patrones.
     */

    use LocaleTrait;
    use PatternPreviewTrait;

    /**
     * 1. Array patrones.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'pattern' => $this->pattern,
            'preview' => $this->getPatternPreview($this->pattern, $this->ndigits ?? 1),
            'status' => $this->status,
            'created_by' => new UserResource($this->createdBy),
            'updated_by' => new UserResource($this->updatedBy),
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
