<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyNoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $owner = $this->owner;

        return [
            'id'        => $this->id,
            'title'     => $this->title,
            'body'      => $this->body,              // HTML del WYSIWYG
            'tags'      => $this->tags ?: [],
            'relevance' => (int) $this->relevance,

            'remind_at'           => optional($this->remind_at)->toDateString(),
            'remind_at_formatted' => optional($this->remind_at)->format('d/m/Y'),

            'created_at'          => optional($this->created_at)->toDateTimeString(),
            'created_at_formatted'=> optional($this->created_at)->format('d/m/Y H:i'),

            'owner' => [
                'id'   => $owner?->id,
                'name' => $owner?->full_name
                    ?? trim(($owner->name ?? '') . ' ' . ($owner->surname ?? '')),
            ],

            'is_pinned'   => (bool) $this->is_pinned,
            'is_archived' => (bool) $this->is_archived,

            'contact' => $this->whenLoaded('contact', function () {
                return [
                    'id'        => $this->contact->id,
                    'name'      => $this->contact->name,
                    'surname'   => $this->contact->surname,
                    'full_name' => $this->contact->full_name,
                ];
            })
        ];
    }
}
