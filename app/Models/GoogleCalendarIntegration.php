<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoogleCalendarIntegration extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'google_sub',
        'google_email',
        'calendar_id',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'scopes',
        'sync_token',
        'channel_id',
        'resource_id',
        'channel_expiration',
        'is_enabled',
        'last_synced_at',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'scopes' => 'array',
        'channel_expiration' => 'datetime',
        'is_enabled' => 'boolean',
        'last_synced_at' => 'datetime',

        // Laravel encrypted casts (bien por seguridad, mal por debugging)
        'access_token' => 'encrypted',
        'refresh_token' => 'encrypted',
        'sync_token' => 'encrypted',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
