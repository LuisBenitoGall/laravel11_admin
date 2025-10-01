<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class ContentResource extends JsonResource{
    /**
     * 1. Array contenidos.
     */
    
    use LocaleTrait;

    /**
     * 1. Array contenidos.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'referrer' => $this->referrer,
            'type' => $this->type,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'tags' => $this->tags,
            'video' => $this->video,
            'classes' => $this->classes,
            'status' => $this->status,
            'observations' => $this->observations,
            'published_at' => $this->published_at ? Carbon::parse($this->published_at)->format($locale[4]):'',
            'published_end' => $this->published_end ? Carbon::parse($this->published_end)->format($locale[4]):'',
            'created_by' => new UserResource($this->createdBy),
            'updated_by' => new UserResource($this->updatedBy),
            'deleted_at' => $this->deleted_at, 
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
