<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CostCenterFilterRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('cost-centers.index');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name'       => 'nullable|string|max:255'
        ];
    }

    /**
     * Custom error messages
     */
    public function messages(): array{
        return [
            'date_from.date' => __('fecha_formato_error'),
            'date_to.date' => __('fecha_formato_error'),
            'date_from.before_or_equal' => __('fecha_inicio_posterior'),
            'date_to.after_or_equal' => __('fecha_fin_anterior'),
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
