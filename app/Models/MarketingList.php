<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MarketingList extends Model
{
    /**
     * 
     */
    
    use SoftDeletes;

    protected $table = 'marketing-lists';
}
