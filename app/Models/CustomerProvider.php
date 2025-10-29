<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerProvider extends Model{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     */
    
    use SoftDeletes;

    protected $table = 'customer_providers';

    protected $dates = ['deleted_at'];

    protected $fillable = [
        'customer_id',
        'provider_id',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'settings'   => 'array'
    ];

    /**
     * 1. Creada por.
     */
    public function createdBy(){
       return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Actualizada por.
     */
    public function updatedBy(){
       return $this->belongsTo(User::class, 'updated_by');
    }

}
