<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorizable extends Model
{
    protected $table = 'categorizables';

    // La tabla NO tiene clave primaria autoincremental
    protected $primaryKey = null;
    public $incrementing = false;

    // La tabla solo tiene created_at, así que desactivamos timestamps
    public $timestamps = false;

    // Mass assignment: lo que vamos a insertar
    protected $fillable = [
        'company_id',
        'category_id',
        'categorizable_type',
        'categorizable_id',
        'extra',
    ];

    protected $casts = [
        'extra' => 'array',
    ];
}
