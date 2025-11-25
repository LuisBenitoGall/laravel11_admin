<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmContactMessage extends Model
{
    /**
     * 
     */
    
    use SoftDeletes;
    
    protected $table = 'crm_contact_messages';
}
