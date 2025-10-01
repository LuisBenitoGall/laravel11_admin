<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class AccountingAccountTypeStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('accounting-account-types.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'code' => "required|integer|unique:accounting_account_types,code",
            'name' => 'required|string|max:255'
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('nombre_oblig'),
            'code.required' => __('campo_requerido'),
            'code.integer' => __('valor_numerico_error'),
            'code.unique' => __('codigo_unico_error')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
