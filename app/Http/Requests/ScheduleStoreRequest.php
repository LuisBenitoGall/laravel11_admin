<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Exceptions\CustomAuthorizationException;
use App\Traits\HasScheduleRoles;

class ScheduleStoreRequest extends FormRequest
{
    use HasScheduleRoles;

    public function authorize(): bool
    {
        return $this->user()->can('schedules.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'regex:/^#([0-9a-fA-F]{6})$/'],
            'status' => ['nullable', 'boolean'],
            'google_calendar_id' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => __('campo_requerido'),
            'name.max' => __('texto_max_error'),
            'color.regex' => __('formato_color_invalido'),
        ];
    }

    protected function failedAuthorization()
    {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
