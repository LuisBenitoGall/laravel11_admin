<?php

// app/Models/UserPreference.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class UserPreference extends Model{
    protected $fillable = [
        'name', 'url', 'module', 'user_id', 'company_id',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeForUser(Builder $q, int $userId): Builder {
        return $q->where('user_id', $userId);
    }

    public function scopeForCompany(Builder $q, ?int $companyId): Builder {
        // si es null, devuelve tanto null como exactos null (modo “global”)
        return is_null($companyId)
            ? $q->whereNull('company_id')
            : $q->where(function ($qq) use ($companyId) {
                $qq->whereNull('company_id')->orWhere('company_id', $companyId);
            });
    }

    public function scopeAlphabetical(Builder $q): Builder {
        return $q->orderBy('name', 'asc');
    }
}

