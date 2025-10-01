<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerProvider extends Model{
    /**
     * 
     */
    
    use SoftDeletes;

    protected $table = 'customer_providers';

    protected $dates = ['deleted_at'];

    protected $casts = [
        'settings'   => 'array'
    ];

}
