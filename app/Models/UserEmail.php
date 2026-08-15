<?php

namespace App\Models;

use App\Support\DataStandards\EmailNormalizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserEmail extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'observations',
    ];

    public function setEmailAttribute($value): void
    {
        if ($value === null || (is_string($value) && $value === '')) {
            $this->attributes['email'] = null;

            return;
        }
        $this->attributes['email'] = is_string($value)
            ? EmailNormalizer::normalize($value)
            : $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
