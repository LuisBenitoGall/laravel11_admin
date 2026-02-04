<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Vincula usuarios con centros de coste en contexto multiempresa.
 * Spec: openspec/specs/core/models/user_cost_center.md
 */
class UserCostCenter extends Model
{
    protected $table = 'user_cost_centers';

    protected $fillable = [
        'company_id',
        'user_id',
        'cost_center_id',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class);
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
