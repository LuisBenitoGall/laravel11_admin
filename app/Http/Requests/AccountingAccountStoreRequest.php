<?php

namespace App\Http\Requests;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Exceptions\CustomAuthorizationException;

//Models:
use App\Models\AccountingAccount;

class AccountingAccountStoreRequest extends FormRequest{
    public function authorize(): bool{
        return $this->user()->can('accounting-accounts.create');
    }

    public function rules(): array{
        return [
            // Básicos
            'name'   => ['required','string','max:255'],

            // Naturaleza (obligatoria)
            'nature' => ['required', Rule::in(AccountingAccount::natureCodes())],

            // Código manual vs asistente PGC (mutuamente excluyentes)
            'manual_code' => [
                'nullable','string','max:30',
                'required_without:level1',
                // si hay asistente, prohibir manual_code
                Rule::prohibitedIf(fn () => $this->filled('level1')),
            ],

            // Asistente por niveles: con que venga level1 ya hay rama PGC
            'level1' => ['nullable','integer','required_without:manual_code'],
            'level2' => ['nullable','integer'],
            'level3' => ['nullable','integer'],
            'level4' => ['nullable','integer'],
            'digits' => ['nullable','string','max:30'],

            // Jerarquía
            'parent_id' => ['nullable','integer','exists:accounting_accounts,id'],

            // Operativa
            'is_group'  => ['nullable','boolean'],
            'reconcile' => ['nullable','boolean', Rule::prohibitedIf(fn () => (bool)$this->input('is_group'))],
            'currency_id' => [
                'nullable','integer','exists:currencies,id',
                // prohibido si no es conciliable o si es agrupadora
                Rule::prohibitedIf(fn () => !$this->boolean('reconcile') || (bool)$this->input('is_group')),
            ],

            // Lado “esperado” (ortodoxo: debe concordar con nature si lo envían)
            'normal_side' => [
                'nullable','in:debit,credit',
            ],

            // Saldo de apertura (moneda base)
            'opening_balance' => [
                'nullable','numeric','min:0',
                Rule::prohibitedIf(fn () => (bool)$this->input('is_group')),
            ],

            // Varios
            'featured' => ['nullable','boolean'],
            'status'   => ['nullable','boolean'],
            'notes'    => ['nullable','string','max:1500'],
        ];
    }

    public function messages(): array{
        return [
            'name.required'   => __('campo_requerido'),
            'nature.required' => __('campo_requerido'),
            'manual_code.required_without' => __('requerido_si_no_asistente'),
            'level1.required_without'      => __('requerido_si_no_manual'),
        ];
    }

    protected function prepareForValidation(): void{
        // Normaliza booleans para que las Rule::prohibitedIf funcionen bien
        $this->merge([
            'is_group'  => filter_var($this->input('is_group'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'reconcile' => filter_var($this->input('reconcile'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'status'    => filter_var($this->input('status'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);

        $raw = (string) ($this->input('opening_balance') ?? '');
        $norm = $raw === '' ? 0 : (float) str_replace(',', '.', $raw);

        if ($this->boolean('is_group')) {
            $norm = 0;
        }
        $this->merge(['opening_balance' => $norm]);
    }

    public function withValidator($validator){
        $validator->after(function ($v) {
            // Si vino normal_side, debe concordar con la naturaleza “académica”
            $expected = AccountingAccount::normalSideByNature((string)$this->input('nature'));
            $sent = $this->input('normal_side');

            // Comentado: si prefieres simplemente ignorar el campo, borra este bloque.
            if ($sent !== null && $expected !== null && $sent !== $expected) {
                $v->errors()->add('normal_side', __('debe_concordar_con_tipo'));
            }

            // Si es agrupadora, fuerza limpieza lógica (no error, solo coherencia)
            if ($this->boolean('is_group')) {
                $this->merge([
                    'reconcile'        => false,
                    'currency_id'      => null,
                    'opening_balance'  => null,
                    'normal_side'      => null,
                ]);
            }
        });
    }

    protected function failedAuthorization(){
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
