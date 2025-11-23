<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmMarketingListTmp extends Model
{
    /**
     * 
     */
    
    protected $table = 'crm_marketing_lists_tmp';

    protected $fillable = [
        'external_id',
        'list_name',
        'type',
        'tipo_integrante_lista',
        'last_use',
        'author',
        'created_date',
        'num_members',
        'owner',
        'list_id'
    ];
}
