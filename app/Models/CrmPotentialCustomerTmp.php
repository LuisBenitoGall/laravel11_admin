<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmPotentialCustomerTmp extends Model
{
    protected $table = 'crm_potential_customers_tmp';

    protected $fillable = [
        'external_id',
        'name',
        'surname',
        'email',
        'created_date',
        'owner',
        'issue',
        'status_reason',
        'cp',
        'description',
        'address',
        'interest_level'
    ];

    protected $casts = [
        'created_date' => 'datetime',
    ];
       
    public $timestamps = false; 
}
