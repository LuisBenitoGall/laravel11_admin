<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class CurrencyUpdateRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('currencies.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        $currencyId = $this->route('currency');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('currencies', 'name')
                    ->ignore($currencyId)        // Ignora el registro actual
                    ->whereNull('deleted_at')    // Solo filas no eliminadas lógicamente
            ],
            'code' => [
                'nullable',
                'string',
                'max:3',
                Rule::unique('currencies', 'code')
                    ->ignore($currencyId)        
                    ->whereNull('deleted_at')
            ],
            'number' => [
                'nullable',
                'string',
                'max:4',
                Rule::unique('currencies', 'number')
                    ->ignore($currencyId)        
                    ->whereNull('deleted_at')
            ]
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('campo_requerido'),
            'name.unique' => __('valor_unico_error'),
            'code.unique' => __('valor_unico_error'),
            'number.unique' => __('valor_unico_error')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
