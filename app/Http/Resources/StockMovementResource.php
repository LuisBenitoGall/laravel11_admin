<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

//Traits:
use App\Traits\HasSignStockMovementsTrait;
use App\Traits\LocaleTrait;

class StockMovementResource extends JsonResource{
    /**
     * 1. Array movimientos.
     */
    
    use HasSignStockMovementsTrait;
    use LocaleTrait;

    /**
     * 1. Array movimientos.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array{
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $explanations = $this->explanation? unserialize($this->explanation):false;
        $explanation_ = $explanations? $explanations[$locale[0]]:'';

        $sign_ = $this->sign? HasSignStockMovementsTrait::signStockMovements()[$this->sign]:'';

        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'translations' => $this->translations,
            'acronym' => $this->acronym,
            'sign' => $sign_,
            'basic' => $this->basic,
            'domestic_consumption' => $this->domestic_consumption,
            'limit' => $this->limit,
            'explanation' => $explanation_,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at, 
            'created_at' => Carbon::parse($this->created_at)->format($locale[4]),
            'updated_at' => Carbon::parse($this->updated_at)->format($locale[4])
        ];
    }
}
