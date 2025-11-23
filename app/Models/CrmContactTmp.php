<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmContactTmp extends Model{
    /**
     * 
     */
    
    protected $table = 'crm_contacts_tmp';

    protected $fillable = [
        'external_id',
        'email',
        'company_name',
        'normalized_company_name',
        'company_phone',
        'status',
        'user_name',
        'surname',
        'last_year_service',
        'cost_center',
        'department',
        'description',
        'address1',
        'address1_street1',
        'address1_street2',
        'address1_street3',
        'city1',
        'cp1',
        'province1',
        'country1',
        'currency',
        'created_date',
        'owner',
        'position',
        'responsable',
        'sex',
        'mobile',
        'phone_private1',
        'contact_type',
    ];

    public $timestamps = false;
}
