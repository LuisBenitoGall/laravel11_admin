<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketingCampaignList extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'marketing_campaign_lists';

    protected $fillable = [
        'company_id',
        'marketing_campaign_id',
        'marketing_list_id',
        'estimated_recipients',
        'actual_recipients',
    ];

    protected $casts = [
        'estimated_recipients' => 'integer',
        'actual_recipients'    => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(MarketingCampaign::class, 'marketing_campaign_id');
    }

    public function list(): BelongsTo
    {
        return $this->belongsTo(MarketingList::class, 'marketing_list_id');
    }
}
