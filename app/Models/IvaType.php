<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IvaType extends Model{
    /**
     * 
     */
    use HasFactory, SoftDeletes;

    protected $table = 'iva_types';

    protected $fillable = ['name', 'iva', 'equivalence_surcharge', 'status'];

    protected function casts(): array {
        return [
            'iva'                   => 'decimal:2',
            'equivalence_surcharge' => 'decimal:2',
            'status'                => 'boolean',
            'deleted_at'            => 'datetime',
        ];
    }

    // Scopes útiles
    public function scopeActive($q){ return $q->where('status', true); }
}
