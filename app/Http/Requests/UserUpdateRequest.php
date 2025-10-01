<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class UserUpdateRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool {
        return $this->user()->can('users.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        $userId = $this->route('user');

        return [
            'role' => 'required|integer',
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'string',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($userId)        
                    ->whereNull('deleted_at')
            ],
            'signature' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:1024'
        ];
    }

    public function messages(): array{
        return [
            'role.required' => __('role_oblig'),
            'name.required' => __('nombre_oblig'),
            'surname.required' => __('apellido_oblig'),
            'email.email' => __('email_formato_error'),
            'email.required' => __('email_oblig'),
            'email.unique' => __('email_unico_error')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
