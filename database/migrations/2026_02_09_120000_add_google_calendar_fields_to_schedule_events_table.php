<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Añade campos para sincronización bidireccional con Google Calendar.
     * - google_event_id: id del evento en Google (único por evento para evitar duplicados).
     * - google_calendar_id: id del calendario de Google asociado (cada Schedule puede mapear a un calendar_id).
     */
    public function up(): void
    {
        Schema::table('schedule_events', function (Blueprint $table) {
            $table->string('google_event_id', 255)->nullable()->after('status');
            $table->string('google_calendar_id', 255)->nullable()->after('google_event_id');

            $table->unique('google_event_id', 'schedule_events_google_event_id_unique');
            $table->index('google_calendar_id', 'schedule_events_google_calendar_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('schedule_events', function (Blueprint $table) {
            $table->dropUnique('schedule_events_google_event_id_unique');
            $table->dropIndex('schedule_events_google_calendar_id_index');
            $table->dropColumn(['google_event_id', 'google_calendar_id']);
        });
    }
};
