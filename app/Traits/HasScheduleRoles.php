<?php

namespace App\Traits;

trait HasScheduleRoles
{
    /**
     * Constantes de roles de schedule
     */
    public const ROLE_OWNER = 'owner';
    public const ROLE_EDITOR = 'editor';
    public const ROLE_VIEWER = 'viewer';

    /**
     * Obtener todos los roles válidos
     *
     * @return array<string>
     */
    public static function scheduleRoles(): array
    {
        return [
            self::ROLE_OWNER,
            self::ROLE_EDITOR,
            self::ROLE_VIEWER,
        ];
    }

    /**
     * Verificar si un rol es válido
     *
     * @param string $role
     * @return bool
     */
    public static function isValidScheduleRole(string $role): bool
    {
        return in_array(self::normalizeScheduleRole($role), self::scheduleRoles(), true);
    }

    /**
     * Normalizar rol (lowercase + trim)
     *
     * @param string $role
     * @return string
     */
    public static function normalizeScheduleRole(string $role): string
    {
        return strtolower(trim($role));
    }
}
