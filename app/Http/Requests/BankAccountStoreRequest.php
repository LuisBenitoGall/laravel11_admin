<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class BankAccountStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('bank-accounts.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'bank_id' => 'required|integer',
            'accounting_account_id' => 'nullable|integer',
            'country_code' => 'required|string|max:4',
            'entity' => 'required|string|max:4',
            'office' => 'required|string|max:4',
            'dc' => 'required|string|max:2',
            'digits' => 'required|string|max:10',
            'featured' => 'nullable',
            'status' => 'nullable'
        ];
    }

    public function messages(): array{
        return [
            'bank_id.required' => __('campo_requerido'),
            'country_code.required' => __('campo_requerido'),
            'entity.required' => __('campo_requerido'),
            'office.required' => __('campo_requerido'),
            'dc.required' => __('campo_requerido'),
            'digits.required' => __('campo_requerido')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
