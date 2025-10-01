<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Content extends Model{
    /**
     * 1. Creado por.
     * 2. Actualizado por.
     */
     
    use HasFactory;
    use SoftDeletes;

    protected $table = 'contents';

    protected $dates = ['deleted_at'];

    protected $fillable = ['id', 'name', 'code', 'referrer', 'type', 'title', 'slug', 'excerpt', 'content', 'tags', 'links', 'video', 'classes', 'status', 'observations', 'published_at', 'published_end', 'created_by', 'updated_by'];

    public array $translatable = [
        'title', 'excerpt', 'content'
    ];

    protected function casts(): array{
        return [
            'title'        => 'array',   // JSON <-> array
            'excerpt'      => 'array',
            'content'      => 'array',
            'tags'         => 'array',
            'status'       => 'boolean',
            'published_at' => 'datetime',
            'published_end'=> 'datetime',
        ];
    }

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

    public function scopeActive($q){ return $q->where('status', true); }

    public function scopePublishedNow($q){
        $now = now();
        return $q->where('status', true)
        ->where(function ($q) use ($now) {
            $q->whereNull('published_at')->orWhere('published_at', '<=', $now);
        })
        ->where(function ($q) use ($now) {
            $q->whereNull('published_end')->orWhere('published_end', '>=', $now);
        });
    }
}
