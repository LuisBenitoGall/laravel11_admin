<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasScheduleRoles;

class Schedule extends Model
{
    use HasFactory, SoftDeletes, HasScheduleRoles;

    protected $table = 'schedules';

    protected $fillable = [
        'company_id',
        'owner_id',
        'name',
        'description',
        'color',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * Relaciones
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function events()
    {
        return $this->hasMany(ScheduleEvent::class, 'schedule_id');
    }

    public function authorizedUsers()
    {
        return $this->belongsToMany(User::class, 'schedule_user', 'schedule_id', 'user_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Scope: agendas visibles para un usuario (owner o compartidas)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param \App\Models\User $user
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVisibleTo($query, User $user)
    {
        return $query->where(function ($q) use ($user) {
            // Owner
            $q->where('owner_id', $user->id)
                // O compartidas (existe en pivot)
                ->orWhereHas('authorizedUsers', function ($pivotQuery) use ($user) {
                    $pivotQuery->where('user_id', $user->id);
                });
        });
    }

    /**
     * Scope: por empresa
     */
    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Scope: activas
     */
    public function scopeActive($query, bool $active = true)
    {
        return $query->where('status', $active);
    }
}
