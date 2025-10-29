<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class BankAccountResource extends JsonResource{
    /**
     * 1. Array cuentas bancarias.
     */

    /**
     * 1. Array cuentas bancarias.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'accounting_account_id' => $this->accounting_account_id,
            'bank' => $this->tradename? $this->tradename:$this->bank,
            'bank_id' => $this->bank_id,
            'account' => $this->account,
            'iban' => $this->iban,
            'entity' => $this->entity,
            'office' => $this->office,
            'dc' => $this->dc,
            'digits' => $this->digits,
            'featured' => $this->featured,
            'status' => $this->status,
            'created_by' => new UserResource($this->createdBy),
            'updated_by' => new UserResource($this->updatedBy),
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
