<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CostCenter extends Model{
    use SoftDeletes;

    protected $table = 'cost_centers';

    /**
     * @var array
     */
    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'status',
    ];

    /**
     * Relations
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Scopes
     */
    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
