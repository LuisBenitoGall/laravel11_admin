<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class IvaTypeUpdateRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('iva-types.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:255',
            'iva' => 'required|numeric|regex:/^\d{1,3}(\.\d{1,2})?$/|lte:100'   
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('tipo_oblig'),
            'iva.required' => __('iva_oblig'),
            'iva.numeric' => __('valor_numerico_oblig'),
            'iva.regex' => __('iva_formato_error'),         
            'iva.gte' => __('iva_min_error'),               
            'iva.lte' => __('iva_max_error')               
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
