<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class MarketingListUser extends Model
{
    protected $table = 'marketing_list_users';

    protected $fillable = [
        'marketing_list_id',
        'user_id',
        'observations',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function marketingList()
    {
        return $this->belongsTo(MarketingList::class, 'marketing_list_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForList(Builder $query, int $listId): Builder
    {
        return $query->where('marketing_list_id', $listId);
    }

    /**
     * Devuelve el número de miembros de una lista concreta.
     */
    public static function countForList(int $listId): int
    {
        return static::forList($listId)->count();
    }
}
