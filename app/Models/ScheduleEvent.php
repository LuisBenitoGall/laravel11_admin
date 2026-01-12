<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduleEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'schedule_events';

    protected $fillable = [
        'company_id',
        'schedule_id',
        'created_by',
        'title',
        'description',
        'location',
        'starts_at',
        'ends_at',
        'all_day',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'all_day' => 'boolean',
    ];

    /**
     * Relaciones
     */
    public function schedule()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope: por empresa
     */
    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Scope: por rango temporal (solape)
     * Devuelve eventos que se solapan con el rango [start, end]
     */
    public function scopeInRange($query, $start, $end)
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->where(function ($subQ) use ($start, $end) {
                // Evento empieza antes del final del rango Y termina después del inicio del rango
                $subQ->where('starts_at', '<', $end)
                    ->where('ends_at', '>', $start);
            });
        });
    }

    /**
     * Scope: por agendas
     */
    public function scopeForSchedules($query, array $scheduleIds)
    {
        if (empty($scheduleIds)) {
            return $query->whereRaw('1 = 0'); // No results
        }
        return $query->whereIn('schedule_id', $scheduleIds);
    }
}
