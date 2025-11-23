<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
