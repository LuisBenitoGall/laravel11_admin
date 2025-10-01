<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('units', function (Blueprint $table){
            $table->id();

            $table->string('name', 191);
            $table->string('slug', 191);
            $table->string('symbol', 32);

            // i18n como JSON
            $table->json('translations')->nullable();

            $table->boolean('status')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // Unicidad global (permitiendo recrear tras soft delete)
            $table->unique(['slug','deleted_at'],   'units_slug_deleted_unique');
            $table->unique(['symbol','deleted_at'], 'units_symbol_deleted_unique');

            // Índices útiles
            $table->index('name',       'units_name_index');
            $table->index('status',     'units_status_index');
            $table->index('deleted_at', 'units_deleted_at_index');
        });

        // CHECK opcional (si tu motor lo soporta)
        try {
            DB::statement("ALTER TABLE units ADD CONSTRAINT chk_units_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE units DROP CONSTRAINT chk_units_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('units');
    }
};
