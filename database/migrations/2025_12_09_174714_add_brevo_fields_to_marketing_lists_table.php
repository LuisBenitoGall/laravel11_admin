<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('marketing_lists', function (Blueprint $table) {
            // ID de la lista en Brevo
            $table->unsignedBigInteger('brevo_list_id')
                  ->nullable()
                  ->after('last_used_at');

            // Opcional: carpeta en Brevo (por si agrupas por empresa/proyecto)
            $table->unsignedBigInteger('brevo_folder_id')
                  ->nullable()
                  ->after('brevo_list_id');

            // Última sincronización correcta con Brevo
            $table->timestamp('brevo_synced_at')
                  ->nullable()
                  ->after('brevo_folder_id');

            // Último estado de sync (ok, error, parcial...)
            $table->string('brevo_sync_status', 20)
                  ->nullable()
                  ->after('brevo_synced_at');

            // Último mensaje de error (si lo hay)
            $table->text('brevo_sync_error')
                  ->nullable()
                  ->after('brevo_sync_status');
        });
    }

    public function down(): void
    {
        Schema::table('marketing_lists', function (Blueprint $table) {
            $table->dropColumn([
                'brevo_list_id',
                'brevo_folder_id',
                'brevo_synced_at',
                'brevo_sync_status',
                'brevo_sync_error',
            ]);
        });
    }
};
