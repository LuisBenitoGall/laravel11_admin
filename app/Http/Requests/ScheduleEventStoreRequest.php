<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Exceptions\CustomAuthorizationException;

class ScheduleEventStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización real se hace en el controller con create [ScheduleEvent::class, $schedule]
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'all_day' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => __('campo_requerido'),
            'title.max' => __('texto_max_error'),
            'starts_at.required' => __('campo_requerido'),
            'starts_at.date' => __('fecha_invalida'),
            'ends_at.required' => __('campo_requerido'),
            'ends_at.date' => __('fecha_invalida'),
            'ends_at.after_or_equal' => __('fecha_fin_debe_ser_posterior'),
        ];
    }

    protected function failedAuthorization()
    {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
