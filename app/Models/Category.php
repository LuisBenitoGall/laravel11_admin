<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model{
    /**
     * 
     */
    
    use SoftDeletes;

    protected $table = 'categories'; 

    protected $dates = ['deleted_at'];

    protected $fillable = ['company_id', 'module', 'parent_id', 'name','slug','translations','path','depth','position','status'];
}
