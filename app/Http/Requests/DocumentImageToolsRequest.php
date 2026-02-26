<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class DocumentImageToolsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('documents.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'crop' => ['sometimes', 'array'],
            'crop.unit' => ['sometimes', 'string', 'in:percent,px'],
            'crop.x' => ['required_with:crop', 'numeric', 'min:0'],
            'crop.y' => ['required_with:crop', 'numeric', 'min:0'],
            'crop.width' => ['required_with:crop', 'numeric', 'min:0.01'],
            'crop.height' => ['required_with:crop', 'numeric', 'min:0.01'],
            'resize' => ['sometimes', 'array'],
            'resize.max_width' => ['required_with:resize', 'integer', 'min:1', 'max:4096'],
            'resize.max_height' => ['required_with:resize', 'integer', 'min:1', 'max:4096'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->has('crop') && ! $this->has('resize')) {
                $validator->errors()->add('crop', __('Indica recorte (crop) y/o redimensionado (resize).'));
            }
        });
    }

    public function messages(): array
    {
        return [
            'crop.x.required_with' => __('Coordenadas de recorte incompletas'),
            'crop.width.required_with' => __('Coordenadas de recorte incompletas'),
            'resize.max_width.required_with' => __('Dimensiones de redimensionado incompletas'),
        ];
    }
}
