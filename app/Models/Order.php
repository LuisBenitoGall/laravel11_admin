<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class Order extends Model
{
    /**
     * 1. Creado por.
     * 2. Actualizado por.
     */
    
    use SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [];

    /**
     * 1. Creado por.
     */
    public function createdBy(){
       return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Actualizado por.
     */
    public function updatedBy(){
       return $this->belongsTo(User::class, 'updated_by');
    }
}
