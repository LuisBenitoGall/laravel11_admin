<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class CurrencyStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('currencies.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:100|unique:currencies,name',
            'code' => 'nullable|string|max:3|unique:currencies,code',
            'number' => 'nullable|string|max:4|unique:currencies,number'
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
