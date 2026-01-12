<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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

    // Scopes
    public function scopeForProduct(Builder $q, int $productId): Builder
    {
        return $q->where('product_id', $productId);
    }

    /**
     * Filtra los docs que son "imágenes".
     * Por defecto: type = 'image'. Puedes ampliar la lista si usas otros valores.
     */
    public function scopeImages(Builder $q, array $types = ['image']): Builder
    {
        return $q->whereIn('type', $types);
    }

    public function scopeOrdered(Builder $q): Builder
    {
        return $q->orderByDesc('featured')->orderByDesc('id');
    }
}
