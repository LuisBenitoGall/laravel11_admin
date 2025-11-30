<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmOpportunity extends Model
{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Propietario.
     * 4. Cuenta CRM.
     * 5. Empresa.
     * 6. Accessor de forecast.      
     * 7. Guardar oportunidad.
     */
    
    use SoftDeletes;

    protected $table = 'crm_opportunities';

    protected $fillable = [
        'name',
        'company_id',
        'user_id',
        'crm_account_id',
        'owner_id',
        'observations',
        'estimated_revenue',
        'actual_revenue',
        'engagement_level',
        'win_probability',
    ];

    protected $casts = [
        'estimated_revenue' => 'decimal:2',
        'actual_revenue'    => 'decimal:2',
        'win_probability'   => 'decimal:2',
    ];

    /**
     * 1. Creada por.
     */
    public function createdBy(){
       return $this->belongsTo(User::class, 'user');
    }

    /**
     * 2. Actualizada por.
     */
    public function updatedBy(){
       return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * 3. Propietario.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * 4. Cuenta CRM.
     */
    public function crmAccount()
    {
        return $this->belongsTo(CrmAccount::class);
    }

    /**
     * 5. Empresa.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * 6. Accessor de forecast.
     */
    public function getWeightedRevenueAttribute(): float
    {
        $estimated = (float) $this->estimated_revenue;
        $prob      = (float) $this->win_probability;

        return $estimated * ($prob / 100);
    }

    /**
     * 7. Guardar oportunidad.
     */
    public function saveOpportunity(){
        
    }
}
