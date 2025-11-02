<?php

namespace App\Http\Requests;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Exceptions\CustomAuthorizationException;
use App\Support\CompanyContext;

//Models:
use App\Models\AccountingAccount;

class AccountingAccountStoreAutoRequest extends FormRequest{
    public function authorize(): bool{
        return $this->user()?->can('accounting-accounts.create') ?? false;
    }

    public function rules(): array{
        $companyId = (int) app(CompanyContext::class)->id();

        return [
            // comunes
            'code'    => [
                'nullable','string','max:30',
                Rule::unique('accounting_accounts','code')
                    ->where(fn($q) => $q->where('company_id', $companyId)),
            ],
            'name'    => ['required','string','max:191'],
            'profile' => ['required','in:iva,customer,supplier,bank,cash'],

            // IVA
            'side'        => ['required_if:profile,iva','in:input,output'],
            'iva_type_id' => ['required_if:profile,iva','integer','exists:iva_types,id'],

            // Clientes/Proveedores
            'entity_id'   => [
                Rule::requiredIf(fn() => in_array($this->input('profile'), ['customer','supplier'], true)),
                'integer'
            ],

            // Bancos/Caja (ajusta si usas tablas propias)
            'bank_id'     => ['required_if:profile,bank','integer'],
            // 'cashbox_id'   => ['required_if:profile,cash','integer'],
        ];
    }

    public function attributes(): array{
        return [
            'code'        => __('codigo_cuenta'),
            'name'        => __('nombre'),
            'profile'     => __('perfil'),
            'side'        => __('lado'),
            'iva_type_id' => __('tipo_iva'),
            'entity_id'   => __('entidad'),
            'bank_id'     => __('banco'),
        ];
    }
}
