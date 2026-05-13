<?php

namespace App\Http\Requests;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

use App\Exceptions\CustomAuthorizationException;

class MarketingCampaignUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('marketing-campaigns.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'owner_id'        => 'nullable|exists:users,id',
            'name'            => 'required|string|max:255',
            'campaign_code'   => 'nullable|string|max:255',
            'campaign_type'   => 'nullable|string|max:50',
            'description'     => 'nullable|string',
            'total_cost'      => 'nullable|numeric|min:0',
            'expected_cost'   => 'nullable|numeric|min:0',
            'currency_id'     => 'nullable|exists:currencies,id',
            'promote_code'    => 'nullable|string|max:255',
            'start_at'        => 'nullable|date',
            'finish_at'       => 'nullable|date|after_or_equal:start_at',
            'cost_center_id'  => 'nullable|exists:cost_centers,id',
            'status'          => 'nullable|integer|min:0|max:9',
            'is_quick'        => 'nullable|boolean',
            'action'          => 'nullable|string|max:255',
            'priority'        => 'nullable',
            'members_type'    => 'nullable|string|max:255',
        ];
    }

    public function messages(): array{
        return [
            'name.required' => __('campo_requerido')
        ];
    }

    protected function failedAuthorization() {
        throw new CustomAuthorizationException(__('permiso_carente_aviso'));
    }
}
