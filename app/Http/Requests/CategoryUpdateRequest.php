<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Support\CompanyContext;
use App\Models\Category;

class CategoryUpdateRequest extends FormRequest{
    public function authorize(): bool{
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
        /** @var Category $current */
        $current     = $this->route('category');
        $parentId    = $this->integer('parent_id') ?: null;

        $existsInScope = Rule::exists('categories', 'id')
            ->where(fn($q) => $q->where('company_id', $companyId)
                                ->where('module', $moduleSlug));

        $existsSiblingSameParent = Rule::exists('categories', 'id')
            ->where(function ($q) use ($companyId, $moduleSlug, $parentId, $current) {
                $q->where('company_id', $companyId)->where('module', $moduleSlug);
                $parentId === null ? $q->whereNull('parent_id') : $q->where('parent_id', $parentId);
                if ($current) $q->where('id', '!=', $current->id);
            });

        return [
            'name'           => ['required','string','max:150'],
            'parent_id'      => ['nullable','integer', $existsInScope],
            'status'         => ['nullable','in:0,1'],
            'positionMode'   => ['nullable', Rule::in(['start','end','after'])],
            'afterSiblingId' => ['nullable','integer','required_if:positionMode,after', $existsSiblingSameParent],
        ];
    }

    public function prepareForValidation(): void{
        $this->merge([
            'name'         => is_string($this->name) ? trim($this->name) : $this->name,
            'parent_id'    => $this->filled('parent_id') ? (int) $this->parent_id : null,
            'status'       => $this->boolean('status') ? 1 : 0,
            // en update puedes no tocar la posición; si viene vacía no se reordena
            'positionMode' => $this->input('positionMode'),
        ]);
    }

    public function withValidator($validator): void{
        $validator->after(function ($v) {
            /** @var Category|null $current */
            $current = $this->route('category');
            if (!$current) {
                return;
            }

            // 1) No me pongas de padre a mí mismo
            if ($this->filled('parent_id') && (int) $this->input('parent_id') === (int) $current->id) {
                $v->errors()->add('parent_id', __('categoria_no_puede_ser_su_propia_padre'));
            }

            // 2) Evitar mover debajo de un descendiente (ciclos)
            if ($this->filled('parent_id')) {
                $parent = Category::query()->find((int) $this->input('parent_id'));
                if ($parent && $current->path) {
                    $prefix = rtrim($current->path, '/') . '/';
                    if (str_starts_with($parent->path . '/', $prefix)) {
                        $v->errors()->add('parent_id', __('categoria_no_puede_moverse_a_su_descendiente'));
                    }
                }
            }
        });
    }

    public function messages(): array{
        return [
            'name.required'             => __('campo_requerido'),
            'name.max'                  => __('longitud_maxima_superada'),
            'parent_id.integer'         => __('valor_invalido'),
            'parent_id.exists'          => __('padre_categoria_invalida'),
            'status.in'                 => __('valor_invalido'),
            'positionMode.in'           => __('valor_invalido'),
            'afterSiblingId.required_if'=> __('selecciona_hermano'),
            'afterSiblingId.exists'     => __('hermano_invalido'),
        ];
    }
}
