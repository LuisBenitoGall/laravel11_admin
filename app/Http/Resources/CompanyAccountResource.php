<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\LocaleTrait;

class CompanyAccountResource extends JsonResource{
    /**
     * 1. Array cuentas de empresa.
     */
    
    use LocaleTrait;

    /**
     * 1. Array cuentas de empresa.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        return [
            'id' => $this->id,
            'name' => $this->account->name,
            'company_id' => $this->company_id,
            'guardian' => $this->guardian,
            'account_id' => $this->account_id,
            'start_date' => $this->start_date ? Carbon::parse($this->start_date)->format($locale[4]):'',
            'end_date' => $this->end_date && $this->end_date == config('constants.UNDEFINED_DATE_')? ucfirst(__('indefinido')):Carbon::parse($this->end_date)->format($locale[4]),
            'price' => $this->price.config('constants.CURRENCY_'),
            'payment_date' => $this->payment_date ? Carbon::parse($this->payment_date)->format($locale[4]):'',
            'status' => $this->status,
            'deleted_at' => $this->deleted_at, 
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}