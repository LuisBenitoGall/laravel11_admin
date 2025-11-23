<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MarketingCampaign extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'marketing_campaigns';

    /**
     * Asignación masiva
     */
    protected $fillable = [
        'owner_id',
        'company_id',

        'name',
        'campaign_code',
        'campaign_type',
        'description',

        'total_cost',
        'expected_cost',
        'currency_id',

        'promote_code',

        'start_at',
        'finish_at',

        'cost_center_id',

        'created_by',
        'updated_by',

        'status',

        'external_id',
        'source_system',
        'source_type',
        'is_quick',
    ];

    /**
     * Casts de atributos
     */
    protected $casts = [
        'total_cost'    => 'decimal:2',
        'expected_cost' => 'decimal:2',

        'start_at'  => 'datetime',
        'finish_at' => 'datetime',

        'status'   => 'integer',
        'is_quick' => 'boolean',
    ];

    /**
     * Relaciones
     */

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Listas de marketing asociadas a la campaña.
     * Ajusta nombre de pivot si usaste otro.
     */
    public function lists()
    {
        return $this->belongsToMany(
            MarketingList::class,
            'marketing_campaign_lists', 
            'campaign_id',
            'list_id'
        )->withTimestamps();
    }

    /**
     * Scopes útiles
     */

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function scopeQuick($query)
    {
        return $query->where('is_quick', true);
    }

    public function scopeNormal($query)
    {
        return $query->where('is_quick', false);
    }
}
