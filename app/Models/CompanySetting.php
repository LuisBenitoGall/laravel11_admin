<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanySetting extends Model{
    /**
     * 1. Configuración por empresa.
     * 2. Moneda de la empresa.
     * 3. IVA de la empresa.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'company_settings';

    protected $fillable = [
        'company_id','currency_id',
        'customers_management','providers_management','validate_nif',
        'primary_color','secondary_color','base_color_budgets','base_color_orders','base_color_invoices',
        'iva','ip','emails','public_info',
    ];

    protected function casts(): array{
        return [
            'customers_management' => 'boolean',
            'providers_management' => 'boolean',
            'validate_nif'         => 'boolean',
            'iva'                  => 'decimal:2',
            'emails'               => 'array',
            'public_info'          => 'array',
        ];
    }

    // Relaciones
    public function company(){ return $this->belongsTo(Company::class); }
    public function currency(){ return $this->belongsTo(Currency::class); }

    /**
     * 1. Configuración por empresa.
     */
    public static function companySettings($company_id){
        return static::with(['company:id,name,logo,nif'])
            ->where('company_id', $company_id)
            ->first();
    }

    /**
     * 2. Moneda de la empresa.
     */
    public static function co_currency($index = false, $company_id = false){
        $companyId = $company_id ?: session('currentCompany');

        $data = static::query()
            ->join('currencies', 'company_settings.currency_id', '=', 'currencies.id')
            ->where('company_settings.company_id', $companyId)
            ->select('currencies.id','currencies.name','currencies.code','currencies.number','currencies.symbol')
            ->first();

        if (!$data) {
            $data = Currency::where('code', config('constants.CURRENCY_NAME_'))->first();
        }

        if ($data && !$data->symbol) {
            $euro   = ['EUR'];
            $dollar = ['USD','USN','USS'];
            if (in_array($data->code, $euro, true))   { $data->symbol = '€'; }
            if (in_array($data->code, $dollar, true)) { $data->symbol = '$'; }
        }

        return $data;
    }

    /**
     * 3. IVA de la empresa.
     */
    public static function co_iva(){
        $row = static::select('iva')
            ->where('company_id', session('currentCompany'))
            ->first();

        return $row? $row->iva : config('constants.IVA_DEFAULT_');
    }
}
