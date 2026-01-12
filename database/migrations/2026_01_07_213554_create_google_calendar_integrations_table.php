<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('google_calendar_integrations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Multiempresa: si lo dejas null, la integración sirve “global” para el usuario.
            // Si lo informas, permite elegir calendar_id distinto por empresa.
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();

            // Identidad Google
            $table->string('google_sub')->nullable()->index();  // "sub" del usuario en Google (si lo guardas)
            $table->string('google_email')->nullable()->index();

            // Calendario destino (p.ej. 'primary' o un calendarId)
            $table->string('calendar_id')->default('primary');

            // OAuth tokens (guardarlos cifrados es lo mínimo exigible)
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->timestamp('token_expires_at')->nullable();

            // Scopes concedidos
            $table->json('scopes')->nullable();

            // Sync incremental y push channels (para futuro)
            $table->text('sync_token')->nullable();
            $table->string('channel_id')->nullable();
            $table->string('resource_id')->nullable();
            $table->timestamp('channel_expiration')->nullable();

            $table->boolean('is_enabled')->default(true);
            $table->timestamp('last_synced_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_calendar_integrations');
    }
};
