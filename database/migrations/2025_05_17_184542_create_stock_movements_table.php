<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();

            $table->string('name', 191);
            $table->string('slug', 191);          // clave “humana”
            $table->char('acronym', 3);           // ENT, SAL, TRS
            $table->char('sign', 1);              // '+', '-', 'T'
            $table->boolean('domestic_consumption')->default(false);
            $table->unsignedInteger('limit')->nullable();  // umbral opcional (>=0)

            $table->json('translations')->nullable();
            $table->text('explanation')->nullable();

            $table->boolean('status')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // Unicidad global compatible con SoftDeletes
            $table->unique(['slug','deleted_at'],    'sm_slug_deleted_unique');
            $table->unique(['acronym','deleted_at'], 'sm_acronym_deleted_unique');
            $table->unique(['name','deleted_at'],    'sm_name_deleted_unique');

            // Índices útiles
            $table->index('status',     'sm_status_index');
            $table->index('deleted_at', 'sm_deleted_at_index');
        });

        // CHECKs (si tu motor lo soporta; si no, a lógica de app y listo)
        try {
            DB::statement("ALTER TABLE stock_movements
                ADD CONSTRAINT chk_sm_sign CHECK (sign IN ('+','-','T'))");
            DB::statement("ALTER TABLE stock_movements
                ADD CONSTRAINT chk_sm_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE stock_movements DROP CONSTRAINT chk_sm_sign"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE stock_movements DROP CONSTRAINT chk_sm_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('stock_movements');
    }
};
