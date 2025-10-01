<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

//Traits
use App\Traits\HasSignStockMovementsTrait;

class StockMovementStoreRequest extends FormRequest{
    use HasSignStockMovementsTrait;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('stock-movements.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        $validSigns = array_keys(HasSignStockMovementsTrait::signStockMovements());

        return [
            'name' => 'required|string|max:150',
            'acronym' => 'required|string|max:3|unique:stock_movements,acronym',
            'sign' => ['required', Rule::in($validSigns)]
        ];
    }

    /**
     * Custom error messages
     */
    public function messages(): array{
        return [
            'name.required' => __('nombre_oblig'),
            'name.max' => __('texto_max_error'),
            'acronym.required' => __('campo_requerido'),
            'acronym.max' => __('texto_max_error'),
            'acronym.unique' => __('valor_unico_error'),
            'sign.required' => __('opcion_oblig')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
