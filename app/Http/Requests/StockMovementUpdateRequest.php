<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Exceptions\CustomAuthorizationException;

//Traits
use App\Traits\HasSignStockMovementsTrait;

class StockMovementUpdateRequest extends FormRequest{
    use HasSignStockMovementsTrait;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return $this->user()->can('stock-movements.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array{
        $validSigns = array_keys(HasSignStockMovementsTrait::signStockMovements());

        // Obtengo el ID del movimiento desde la ruta {movement}
        $movementId = $this->route('movement');

        return [
            'name' => 'required|string|max:150',
            'acronym' => [
                'required',
                'string',
                'max:3',
                Rule::unique('stock_movements', 'acronym')
                    ->ignore($movementId)        // Ignora el registro actual
                    ->whereNull('deleted_at')    // Solo filas no eliminadas lógicamente
            ]
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
            'acronym.unique' => __('valor_unico_error')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
