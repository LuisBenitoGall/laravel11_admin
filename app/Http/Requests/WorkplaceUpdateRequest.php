<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class WorkplaceUpdateRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('workplaces.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        return [
            'name' => 'required|string|max:255',
            'nif' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:150',
            'cp' => 'nullable|string|max:10',
            'town_id' => 'nullable|integer|exists:towns,id',
            'website' => 'nullable|string|max:150',
            'description' => 'nullable|string'
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('centro_nombre_oblig')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
