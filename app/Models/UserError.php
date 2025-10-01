<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class UserError extends Model{
    /**
     * 
     */
    
    use SoftDeletes;

    protected $table = 'user_errors';

    protected $dates = ['deleted_at'];

    protected $fillable = ['id', 'user_id', 'error'];
}
