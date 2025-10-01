<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('accounting_account_types', function (Blueprint $table){
            $table->id();

            // Clave del tipo del plan contable (única)
            $table->string('code', 64);                  // p.ej. "1", "10", "430", "430000"
            $table->string('name', 191)->nullable();     // texto plano, puede repetirse
            $table->char('mode', 2)->nullable();         // opcional (ej. "DR","CR" si lo usas)

            // Autoreferencia (jerarquía): string numérica no negativa (p.ej. "0" o "1")
            // No FK porque pides string; sirve para agrupar por padres
            $table->string('autoreference', 20)->nullable()->default('0');

            $table->timestamps();

            // Reglas
            $table->unique('code', 'aat_code_unique');

            // Índices útiles
            $table->index('autoreference', 'aat_autoref_index');
            $table->index('mode', 'aat_mode_index');
            $table->index('name', 'aat_name_index');
        });

        // CHECKs opcionales (si tu motor los soporta)
        try {
            // Solo dígitos en autoreference (o NULL)
            DB::statement("ALTER TABLE accounting_account_types
                ADD CONSTRAINT chk_aat_autoref_numeric
                CHECK (autoreference IS NULL OR autoreference REGEXP '^[0-9]+$')");
        } catch (\Throwable $e) {
            // Si tu MySQL no traga CHECK, lo validas en app y todos felices.
        }
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE accounting_account_types DROP CONSTRAINT chk_aat_autoref_numeric"); } catch (\Throwable $e) {}
        Schema::dropIfExists('accounting_account_types');
    }
};
