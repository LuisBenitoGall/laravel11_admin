<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmMarketingCampaignsExpressTmp extends Model
{
    protected $table = 'crm_marketing_campaigns_express_tmp';

    protected $fillable = [
        'external_id',
        'name',
        'members_count',
        'send_ok',
        'send_ko',
        'status_reason',
        'created_date',
        'owner',
        'action',
        'priority',
        'members_type',
        'finish_at',
    ];

    protected $casts = [
        'created_date' => 'datetime',
        'finish_at'    => 'datetime',
        'members_count'=> 'integer',
        'send_ok'      => 'integer',
        'send_ko'      => 'integer',
    ];
}
