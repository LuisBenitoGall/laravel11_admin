<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class AccountingAccountStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('accounting-accounts.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string',
            'manual_code' => 'nullable',
            'nature' => ['required', Rule::in(AccountingAccount::natureCodes())],
            'currency_id' => ['nullable','integer','exists:currencies,id'],
            'reconcile' => 'nullable|boolean',
            'level1' => 'nullable|integer',
            'level2' => 'nullable|integer',
            'level3' => 'nullable|integer',
            'level4' => 'nullable|integer',
            'digits' => 'nullable',
            'normal_side' => 'nullable|in:debit,credit',
            'opening_balance' => 'nullable|numeric',
            'is_group' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'status' => 'nullable|boolean',
            'notes' => 'nullable|string|max:1500'
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('campo_requerido'),
            'nature.required' => __('campo_requerido')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
