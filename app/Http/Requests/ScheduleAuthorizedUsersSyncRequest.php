<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Exceptions\CustomAuthorizationException;
use App\Traits\HasScheduleRoles;
use App\Support\CompanyContext;

class ScheduleAuthorizedUsersSyncRequest extends FormRequest
{
    use HasScheduleRoles;

    public function authorize(): bool
    {
        // La autorización real se hace en el controller con manageAuthorizedUsers
        return true;
    }

    public function rules(): array
    {
        $currentCompanyId = app(CompanyContext::class)->id() ?? session('currentCompany', 0);

        return [
            'authorized_users' => ['required', 'array'],
            'authorized_users.*.user_id' => [
                'required',
                'integer',
                'exists:users,id',
                // Validar que el usuario pertenece a la empresa actual
                Rule::exists('user_companies', 'user_id')
                    ->where('company_id', $currentCompanyId),
            ],
            'authorized_users.*.role' => [
                'required',
                'string',
                Rule::in([self::ROLE_EDITOR, self::ROLE_VIEWER]), // owner no editable vía pivot
                function ($attribute, $value, $fail) {
                    if (!self::isValidScheduleRole($value)) {
                        $fail(__('rol_invalido'));
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'authorized_users.required' => __('campo_requerido'),
            'authorized_users.*.user_id.required' => __('campo_requerido'),
            'authorized_users.*.user_id.exists' => __('usuario_no_existe'),
            'authorized_users.*.role.required' => __('campo_requerido'),
            'authorized_users.*.role.in' => __('rol_invalido'),
        ];
    }

    protected function failedAuthorization()
    {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
