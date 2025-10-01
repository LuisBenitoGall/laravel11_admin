<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserFilterRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name'       => 'nullable|string|max:255',
            //'email'      => 'nullable|email|max:255',
            //'date_from'  => 'nullable|date|before_or_equal:date_to',
            //'date_to'    => 'nullable|date|after_or_equal:date_from',
            'sort_field' => 'nullable|string|in:name,email,created_at',
            'sort_direction' => 'nullable|string|in:asc,desc',
            'per_page'   => 'nullable|integer|min:1|max:100',
            'page'       => 'nullable|integer|min:1',
        ];
    }

    /**
     * Custom error messages
     */
    public function messages(): array{
        return [
            'email.email' => __('email_formato_error'),
            'date_from.date' => __('fecha_formato_error'),
            'date_to.date' => __('fecha_formato_error'),
            'date_from.before_or_equal' => __('fecha_inicio_posterior'),
            'date_to.after_or_equal' => __('fecha_fin_anterior'),
        ];
    }
}
