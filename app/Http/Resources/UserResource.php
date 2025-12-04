<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon; 

//Concerns:
use App\Concerns\HasContactTypes;
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

        $salutation    = $this->salutation? HasSalutation::salutationAbbrOf($this->salutation):'';
        $contact_type  = $this->contact_type? HasContactTypes::typesOf($this->contact_type):'';

        $companyId = session('currentCompany');

        // usamos las categorías ya cargadas para evitar N+1
        $categories = $this->relationLoaded('categories')
            ? $this->categories
            : $this->categories()->get();

        $contactSubtypeName = null;

        if ($categories && $categories->isNotEmpty()) {
            if ($companyId && $companyId !== 'all') {
                $categories = $categories->where('company_id', (int) $companyId);
            }

            // si tus subtipos están en el módulo 'users'
            $subtype = $categories
                ->where('module', 'users')
                ->sortBy('name')
                ->first();

            if ($subtype) {
                $contactSubtypeName = $subtype->name;
            }
        }

        return [
            'id'        => $this->id,
            'name'      => $salutation.' '.ucwords($this->name).' '.ucwords($this->surname),
            'surname'   => $this->surname,
            'nickname'  => $this->nickname,
            'email'     => $this->email,
            'sex'       => $this->sex ? strtolower(trim($this->sex))[0] : null,
            'birthday'  => $this->birthday ? Carbon::parse($this->birthday)->format($locale[4]) : null,
            'nif'       => $this->nif,
            'signature' => $this->signature,
            'isAdmin'   => $this->isAdmin,

            'avatar' => $this->avatar && $this->avatar->image 
                ? \Storage::url('users/'.$this->avatar->image)
                : null,

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

            'position'         => $this->position ?? null,
            'department'       => $this->department ?? null,
            'contact_type'     => $contact_type ?? null,
            'contact_subtype'  => $contactSubtypeName,   // 👈 AQUÍ LA MAGIA

            'companies' => $this->companies()->map(function($company) {
                return [
                    'id'   => $company->id,
                    'name' => $company->name,
                    'link' => route('companies.edit', $company->id)
                ];
            })->values(),

            'edit_company_id'     => optional($this)->getAttribute('edit_company_id'),
            'edit_crm_account_id' => optional($this)->getAttribute('edit_crm_account_id'),
            'status'              => $this->status,
            'deleted_at'          => $this->deleted_at,
            'created_at'          => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at'          => Carbon::parse($this->updated_at)->format($locale[4]),
        ];
    }
}
