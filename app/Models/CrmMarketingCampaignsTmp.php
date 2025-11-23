<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmMarketingCampaignsTmp extends Model
{
    protected $table = 'crm_marketing_campaigns_tmp';

    protected $fillable = [
        'external_id',
        'name',
        'status_reason',
        'created_date',
        'total_cost',
        'campaign_code',
        'promote_code',
        'description',
        'currency',
        'author',
        'start_at',
        'finish_at',
        'owner',
        'campaign_type',
        'cost_center',
    ];

    protected $casts = [
        'created_date' => 'datetime',
        'start_at'     => 'datetime',
        'finish_at'    => 'datetime',
        'total_cost'   => 'decimal:2',
    ];
}
