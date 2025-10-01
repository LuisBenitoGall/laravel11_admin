<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class BankStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('banks.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:150|unique:banks,name',
            'tradename' => 'nullable|string|max:150|unique:banks,tradename',
            'lei' => 'nullable|string|max:25|unique:banks,lei',
            'swift' => 'nullable|string|max:11|unique:banks,swift',
            'eu_code' => 'nullable|string|max:10|unique:banks,eu_code',
            'supervisor_code' => 'nullable|string|max:10|unique:banks,supervisor_code'
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('campo_requerido'),
            'name.unique' => __('valor_unico_error'),
            'name.max' => __('texto_max_error'),
            'tradename.unique' => __('valor_unico_error'),
            'tradename.max' => __('texto_max_error'),
            'lei.unique' => __('valor_unico_error'),
            'lei.max' => __('texto_max_error'),
            'swift.unique' => __('valor_unico_error'),
            'swift.max' => __('texto_max_error'),
            'eu_code.unique' => __('valor_unico_error'),
            'eu_code.max' => __('texto_max_error'),
            'supervisor_code.unique' => __('valor_unico_error'),
            'supervisor_code.max' => __('texto_max_error')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
