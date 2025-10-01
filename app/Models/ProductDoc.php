<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductDoc extends Model{
    /**
     * 1. Creado por.
     * 2. Producto del documento.
     */
    use SoftDeletes;

    protected $table = "product_docs";

    protected $fillable = [
        'product_id', 'doc', 'type', 'featured', 'created_by'
    ];

    protected function casts(): array {
        return [
            'featured'   => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * 1. Creado por.
     */
    public function createdBy(){
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Producto del documento.
     */
    public function product(){
        return $this->belongsTo(Product::class);
    }
}
