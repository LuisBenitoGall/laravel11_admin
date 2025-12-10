<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmMarketingListMemberTmp extends Model
{
    protected $table = 'crm_marketing_list_members_tmp';

    protected $fillable = [
        'marketing_list_id',
        'email',
        'company',
        'company_phone',
        'status',
        'surname',
        'cost_center',
        'address1',
        'street1',
        'street2',
        'street3',
        'province',
        'city',
        'country',
        'cp',
        'nif',
        'created_date',
        'name',
        'owner',
        'position',
        'department',
        'description',
        'contact_type',
        'contact_subtype',
        'business_type',
        'salutation',
        'sex',
        'mobile',
        'private_phone1',
        'birthday',
        'is_done'
    ];

    protected $casts = [
        'created_date' => 'datetime',
        'is_done'      => 'boolean',
    ];
}
