<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class PhoneStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'number' => 'required|string|max:15',
            'phoneable_type' => 'required|string|max:15',
            'phoneable_id' => 'required|integer'
        ];
    }

    public function messages(): array{
        return [
            'number.required' => __('campo_requerido')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
