<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class SchedulePermissionsSeeder extends Seeder
{
    /**
     * Registrar permisos de schedule de forma idempotente
     */
    public function run(): void
    {
        // Permiso de módulo
        Permission::firstOrCreate(['name' => 'module_schedule']);

        // Permisos de agendas
        $schedulePermissions = [
            'schedules.index',
            'schedules.show',
            'schedules.create',
            'schedules.update',
            'schedules.destroy',
            'schedules.search',
        ];

        foreach ($schedulePermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Permisos de eventos (con guion, no underscore)
        $eventPermissions = [
            'schedule-events.index',
            'schedule-events.show',
            'schedule-events.create',
            'schedule-events.update',
            'schedule-events.destroy',
            'schedule-events.search',
        ];

        foreach ($eventPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
