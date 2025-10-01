<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserColumnPreference extends Model{
    /**
     * 1. Preferencias por usuario y tablas.
     */
    
    use HasFactory;

    protected $fillable = [
        'user_id',
        'table',
        'columns',
    ];

    protected $casts = [
        'columns' => 'array',
    ];

    /**
     * 1. Preferencias por usuario y tablas.
     */
    public static function forUserAndTables(int $user_id, array $tables){
        return self::where('user_id', $user_id)
            ->whereIn('table', $tables)
            ->get()
            ->pluck('columns', 'table')
            ->toArray();
    }
}
