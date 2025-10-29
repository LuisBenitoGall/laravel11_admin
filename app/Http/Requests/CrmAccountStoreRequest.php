<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class CrmAccountStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('crm-accounts.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:255',
            'tradename' => 'required|string|max:255'
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('empresa_nombre_oblig'),
            'tradename.required' => __('empresa_nombre_comercial_oblig')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
