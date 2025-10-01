<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

class AccountUpdateRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('accounts.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        $accountId = $this->route('account');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('accounts', 'name')
                    ->ignore($accountId)         // Ignora el registro actual
                    ->whereNull('deleted_at')    // Solo filas no eliminadas lógicamente
            ]
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('nombre_oblig'),
            'name.unique' => __('valor_unico_error'),
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
