<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmAccountTmp extends Model
{
    protected $table = 'crm_accounts_tmp';

    protected $fillable = [
        'external_id',
        'account_name',
        'main_phone',
        'city',
        'main_contact',
        'main_email',
        'second_email',
        'status',
        'nif',
        'primary_account',
        'description',
        'address1',
        'address1_street1',
        'address1_street2',
        'cp1',
        'province1',
        'country1',
        'currency',
        'created_date',
        'owner',
        'company_id', // si lo tienes en la tabla tmp
    ];

    public $timestamps = false; // o true si has metido created_at / updated_at
}
