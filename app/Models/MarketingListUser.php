<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

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

    /**
     * Adjunta varios usuarios a una lista, respetando:
     *  - accept_emails = true
     *  - status usuario = 1
     *  - email no vacío
     *  - sin duplicar existentes
     *
     * Devuelve cuántos se han insertado realmente.
     */
    public static function attachUsersToList(int $listId, array $userIds, ?int $actorId = null): int
    {
        // Normalizamos ids
        $userIds = array_values(array_unique(array_filter($userIds, static function ($id) {
            return is_numeric($id);
        })));

        if (empty($userIds)) {
            return 0;
        }

        // Filtramos por accept_emails + email + status
        $eligibleUserIds = User::query()
            ->whereIn('id', $userIds)
            ->acceptsMarketingEmails()
            ->pluck('id')
            ->all();

        if (empty($eligibleUserIds)) {
            return 0;
        }

        // Evitar duplicados en la misma lista
        $existingUserIds = static::query()
            ->where('marketing_list_id', $listId)
            ->whereIn('user_id', $eligibleUserIds)
            ->pluck('user_id')
            ->all();

        $toInsert = array_values(array_diff($eligibleUserIds, $existingUserIds));

        if (empty($toInsert)) {
            return 0;
        }

        $now     = now();
        $actorId = $actorId ?: Auth::id();

        $rows = [];
        foreach ($toInsert as $uid) {
            $rows[] = [
                'marketing_list_id' => $listId,
                'user_id'           => $uid,
                'status'            => 1,
                'observations'      => null,
                'created_by'        => $actorId,
                'updated_by'        => $actorId,
                'created_at'        => $now,
                'updated_at'        => $now,
            ];
        }

        // Insertamos en chunks para no reventar el límite de placeholders
        foreach (array_chunk($rows, 500) as $chunk) {
            static::insert($chunk);
        }

        return count($toInsert);
    }

    /**
     * Versión convenience para un único usuario.
     */
    public static function attachUserToList(int $listId, int $userId, ?int $actorId = null): bool
    {
        return static::attachUsersToList($listId, [$userId], $actorId) > 0;
    }
}