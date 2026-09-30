<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustodyIntakeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        $type = $this->input('type');
        if ($type === 'company') {
            return $user->can('customers.create');
        }
        if ($type === 'user') {
            return $user->can('users.create') || $user->can('customers.create');
        }

        return false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['company', 'user'])],
            'name' => ['nullable', 'string', 'max:191'],
            'email' => ['nullable', 'string', 'max:255'],
            'nif' => ['nullable', 'string', 'max:32'],
        ];
    }
}
