<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class UserStoreRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool {
        return $this->user()->can('users.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        $whenCreating = !$this->filled('user_id');
        return [
            'role' => 'nullable|integer',
            'name' => [Rule::requiredIf($whenCreating), 'string', 'max:255'],
            'surname' => [Rule::requiredIf($whenCreating), 'string', 'max:255'],
            'email' => 'nullable|email|string|max:255|unique:users,email',
            'user_id' => 'nullable|integer|exists:users,id',
            'crm_account_id' => [Rule::requiredIf($this->filled('user_id')), 'nullable', 'integer', 'exists:crm_accounts,id'],
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
