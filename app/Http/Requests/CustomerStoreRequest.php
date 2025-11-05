<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class CustomerStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('customers.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:255',
            'tradename' => 'required|string|max:255',
            'nif' => 'required|string|max:15',
            'logo' => 'sometimes|image|mimes:jpg,jpeg,png,gif|max:1024'
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('empresa_nombre_oblig'),
            'tradename.required' => __('empresa_nombre_comercial_oblig'),
            'nif.required' => __('nif_oblig'),
            'logo.max' => __('imagen_peso_max_error'),
            'logo.mime' => __('imagen_formato_error')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
