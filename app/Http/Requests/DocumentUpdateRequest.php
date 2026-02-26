<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocumentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['nullable', 'string', 'max:512'],
            'alt_text'    => ['nullable', 'string', 'max:512'],
            'description' => ['nullable', 'string'],
        ];
    }
}
