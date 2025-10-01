<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class AccountStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('accounts.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:255|unique:accounts,name',
            'rate' => 'nullable|numeric',
            'duration' => 'nullable|integer'
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('nombre_oblig'),
            'name.unique' => __('valor_unico_error'),
            'rate.numeric' => __('numero_valor_requerido'),
            'duration.integer' => __('numero_entero_requerido')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
