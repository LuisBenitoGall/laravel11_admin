<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustodyIntakeSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        return $user->can('customers.create') || $user->can('users.create');
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['company', 'user'])],
            'email' => ['nullable', 'string', 'max:255'],
            'nif' => ['nullable', 'string', 'max:32'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $email = trim((string) $this->input('email', ''));
            $nif = trim((string) $this->input('nif', ''));
            if ($email === '' && $nif === '') {
                $validator->errors()->add('email', __('intake_identity_email_o_nif'));
            }
        });
    }
}
