<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Session; 
use Carbon\Carbon;

//Traits:
use App\Traits\AccountingAccountTypeTrait;
use App\Traits\LocaleTrait;

class AccountingAccountTypeResource extends JsonResource{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $modes = AccountingAccountTypeTrait::modes();

        return [
            'id' => $this->id,
            'autoreference' => $this->autoreference,
            'code' => $this->code,
            'name' => ucfirst($this->name),
            'level' => strlen($this->code),
            'mode' => $this->mode? $modes[$this->mode]:'',
            'deleted_at' => $this->deleted_at, 
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
