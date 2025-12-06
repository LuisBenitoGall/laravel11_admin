<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLoginCode extends Model
{
    protected $table = 'user_login_codes';

    protected $fillable = [
        'user_id',
        'code',
        'expires_at',
        'used_at',
        'ip_address',
        'user_agent',
    ];

    protected $dates = ['expires_at', 'used_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

