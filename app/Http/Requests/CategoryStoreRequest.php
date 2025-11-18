<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Support\CompanyContext;

class CategoryStoreRequest extends FormRequest{
    public function authorize(): bool{
        // Ya controlas con middleware de permiso; aquí sin drama.
        return true;
    }

    protected function moduleSlugFor(string $environment): string
    {
        return $environment === 'sectors' ? 'companies' : $environment;
    }

    public function rules(): array
    {
        /** @var CompanyContext $ctx */
        $ctx = app(CompanyContext::class);
        $companyId   = (int) $ctx->id();
        $environment = (string) $this->route('environment');
        $moduleSlug  = $this->moduleSlugFor($environment);
        $parentId    = $this->integer('parent_id') ?: null;

        $existsInScope = Rule::exists('categories', 'id')
            ->where(fn($q) => $q->where('company_id', $companyId)
                                ->where('module', $moduleSlug));

        $existsSiblingSameParent = Rule::exists('categories', 'id')
            ->where(function ($q) use ($companyId, $moduleSlug, $parentId) {
                $q->where('company_id', $companyId)->where('module', $moduleSlug);
                $parentId === null ? $q->whereNull('parent_id') : $q->where('parent_id', $parentId);
            });

        return [
            'name'           => ['required', 'string', 'max:150'],
            'parent_id'      => ['nullable', 'integer', $existsInScope],
            'status'         => ['nullable', 'in:0,1'],
            'positionMode'   => ['required', Rule::in(['start','end','after'])],
            'afterSiblingId' => ['nullable','integer','required_if:positionMode,after', $existsSiblingSameParent],
        ];
    }

    public function prepareForValidation(): void {
        $this->merge([
            'name'         => is_string($this->name) ? trim($this->name) : $this->name,
            'parent_id'    => $this->filled('parent_id') ? (int) $this->parent_id : null,
            'status'       => $this->boolean('status') ? 1 : 0,
            'positionMode' => $this->input('positionMode') ?: 'end',
        ]);
    }

    public function messages(): array{
        return [
            'name.required'            => __('campo_requerido'),
            'name.max'                 => __('longitud_maxima_superada'),
            'parent_id.integer'        => __('valor_invalido'),
            'parent_id.exists'         => __('padre_categoria_invalida'),
            'status.in'                => __('valor_invalido'),
            'positionMode.required'    => __('campo_requerido'),
            'positionMode.in'          => __('valor_invalido'),
            'afterSiblingId.required_if' => __('selecciona_hermano'),
            'afterSiblingId.exists'    => __('hermano_invalido'),
        ];
    }
}
