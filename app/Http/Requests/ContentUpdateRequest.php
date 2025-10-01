<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class ContentUpdateRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('contents.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:255',
            'published_at' => 'nullable',
            'published_end'  => 'nullable|required_with:published_at|after_or_equal:published_at',
        ];
    }

    /**
     * Custom error messages
     */
    public function messages(): array{
        return [
            'name.required' => __('nombre_oblig'),
            'name.max' => __('texto_max_error'),
            'published_end.required_with' => __('fecha_fin_oblig'),
            'published_end.after_or_equal' => __('fecha_fin_menor_inicio'),
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
