<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('banks', function (Blueprint $table) {
            $table->id();

            $table->string('name', 191);
            $table->string('slug', 191);
            $table->string('tradename', 191)->nullable();

            // SWIFT/BIC: 8 u 11; almacenamos siempre 11 (si viene 8, lo completamos con 'XXX')
            $table->char('swift', 11)->nullable();

            // LEI: siempre 20 chars alfanuméricos
            $table->char('lei', 20)->nullable();

            $table->string('eu_code', 64)->nullable();
            $table->string('supervisor_code', 64)->nullable();

            $table->boolean('status')->default(false);

            $table->softDeletes();
            $table->timestamps();

            // Unicidad
            $table->unique(['slug','deleted_at'], 'banks_slug_deleted_unique'); // permite recrear tras soft delete
            $table->unique('swift', 'banks_swift_unique');   // NULLs repetidos OK
            $table->unique('lei',   'banks_lei_unique');     // NULLs repetidos OK

            // Índices
            $table->index('name', 'banks_name_index');
            $table->index('status', 'banks_status_index');
            $table->index('deleted_at', 'banks_deleted_at_index');
        });

        // Checks opcionales (si tu motor lo soporta)
        try {
            DB::statement("ALTER TABLE banks ADD CONSTRAINT chk_banks_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE banks DROP CONSTRAINT chk_banks_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('banks');
    }
};
