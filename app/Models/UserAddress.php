<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserAddress extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'user_addresses';

    protected $fillable = [
        'user_id',
        'label',
        'address',
        'address_extra',
        'cp',
        'town_id',
        'observations',
        'is_main',
    ];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function town()
    {
        return $this->belongsTo(Town::class);
    }
}
