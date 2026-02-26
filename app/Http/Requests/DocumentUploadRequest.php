<?php

namespace App\Http\Requests;

use App\Services\DocumentService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class DocumentUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('documents.create') ?? false;
    }

    public function rules(): array
    {
        $maxSize = config('document_gallery.max_file_size', 10 * 1024 * 1024);
        $maxBatch = config('document_gallery.max_batch', 20);
        $allowedExt = implode(',', config('document_gallery.allowed_extensions', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']));

        return [
            'files'   => ['required', 'array', 'max:' . $maxBatch],
            'files.*' => ['required', 'file', "mimes:{$allowedExt}", 'max:' . ($maxSize / 1024)],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $service = app(DocumentService::class);
            $files = $this->file('files') ?? [];

            foreach ($files as $index => $file) {
                try {
                    $service->validateMimeAndExtension($file);
                } catch (\InvalidArgumentException $e) {
                    $validator->errors()->add("files.{$index}", $e->getMessage());
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'files.required'  => __('Se requiere al menos un archivo'),
            'files.max'       => __('Máximo :max archivos por subida', ['max' => config('document_gallery.max_batch', 20)]),
            'files.*.required' => __('Archivo requerido'),
            'files.*.file'    => __('El valor debe ser un archivo válido'),
            'files.*.mimes'   => __('Tipo de archivo no permitido'),
            'files.*.max'     => __('El archivo no puede superar :max KB', ['max' => config('document_gallery.max_file_size', 10485760) / 1024]),
        ];
    }
}
