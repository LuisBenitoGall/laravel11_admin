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
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'all_day' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:50'],
        ];

        // Regla adicional: para eventos con hora (no all_day), exigir al menos 15 minutos
        // entre starts_at y ends_at.
        $rules['ends_at'][] = function (string $attribute, $value, \Closure $fail) {
            // Si es evento de todo el día, la validación estándar de fecha es suficiente.
            if ($this->boolean('all_day')) {
                return;
            }

            $start = $this->input('starts_at');
            if (! $start || ! $value) {
                return;
            }

            $startTs = strtotime($start);
            $endTs = strtotime($value);

            if (! $startTs || ! $endTs) {
                return;
            }

            // Si la fecha/hora de fin es anterior, lo gestionará la regla after_or_equal.
            if ($endTs <= $startTs) {
                return;
            }

            $minIntervalSeconds = 15 * 60;
            if (($endTs - $startTs) < $minIntervalSeconds) {
                $message = __('evento_duracion_minima_15');
                if ($message === 'evento_duracion_minima_15') {
                    $message = 'La hora de fin debe ser al menos 15 minutos posterior a la de inicio.';
                }
                $fail($message);
            }
        };

        return $rules;
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
