<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Phone extends Model{
    /**
     * 
     */
    
    use SoftDeletes;

    protected $table = 'phones';

    protected $dates = ['deleted_at']; //Columna de borrado lógico

    protected $fillable = ['workplace_id', 'phone_number']; 
}
