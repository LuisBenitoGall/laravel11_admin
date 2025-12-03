<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketingList extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'marketing_lists';

    protected $fillable = [
        'owner_id',
        'company_id',
        'name',
        'slug',
        'observations',
        'created_by',
        'updated_by',
        'status',
        'type',
        'is_dynamic',
        'members_count',
        'last_used_at',
    ];

    protected $casts = [
        'is_dynamic'    => 'boolean',
        'members_count' => 'integer',
        'status'        => 'integer',
        'last_used_at'  => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isActive(): bool
    {
        return (int) $this->status === 1;
    }

    public function marketingListUsers(): HasMany
    {
        return $this->hasMany(MarketingListUser::class);
    }

    /**
     * Nº de miembros por lista.
     */
    public function membersCount(): int
    {
        if ($this->relationLoaded('marketingListUsers')) {
            return $this->marketingListUsers->count();
        }

        return $this->marketingListUsers()->count();
    }
}
