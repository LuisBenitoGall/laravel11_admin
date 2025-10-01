<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('iva_types', function (Blueprint $table){
            $table->id();

            $table->string('name', 191);
            // DECIMAL para no invocar a los demonios del float
            $table->decimal('iva', 5, 2);                               // ej. 21.00
            $table->decimal('equivalence_surcharge', 5, 2)->nullable(); // ej. 5.20
            $table->boolean('status')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // No duplicar tipos por nombre (permitiendo recrear tras soft delete)
            $table->unique(['name','deleted_at'], 'iva_types_name_deleted_unique');

            // Índices útiles
            $table->index('status', 'iva_types_status_index');
            $table->index('iva',    'iva_types_iva_index');
            $table->index('deleted_at', 'iva_types_deleted_at_index');
        });

        // Rango sano: 0–100
        try {
            DB::statement("ALTER TABLE iva_types
                ADD CONSTRAINT chk_iva_types_iva CHECK (iva >= 0 AND iva <= 100)");
            DB::statement("ALTER TABLE iva_types
                ADD CONSTRAINT chk_iva_types_eqs CHECK (equivalence_surcharge IS NULL OR (equivalence_surcharge >= 0 AND equivalence_surcharge <= 100))");
            DB::statement("ALTER TABLE iva_types
                ADD CONSTRAINT chk_iva_types_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {
            // Si tu motor no soporta CHECK, seguimos viviendo al límite.
        }
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE iva_types DROP CONSTRAINT chk_iva_types_iva"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE iva_types DROP CONSTRAINT chk_iva_types_eqs"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE iva_types DROP CONSTRAINT chk_iva_types_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('iva_types');
    }
};
