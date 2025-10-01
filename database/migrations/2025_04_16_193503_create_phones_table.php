<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::create('phones', function (Blueprint $table) {
            $table->id();
            // Polimórfica: Company, Workplace, Community, User, etc.
            $table->morphs('phoneable'); // phoneable_type + phoneable_id (ambas indexadas)
            $table->string('e164', 30);  // +34111222333
            $table->foreignId('country_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('ext', 10)->nullable();           // Extensión
            $table->string('type', 32)->default('mobile');   // clave tipo (catálogo en trait) 
            $table->string('label', 50)->nullable();         // texto libre (Recepción, Centralita, etc.)

            $table->boolean('is_primary')->default(false);   // marcar principal por dueño
            $table->boolean('is_whatsapp')->default(false);  // útil para mostrar botón/CTA
            $table->boolean('is_verified')->default(false);  // verificación futura (SMS/llamada)
            $table->timestamp('verified_at')->nullable();

            $table->text('notes')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // Evita duplicar el mismo e164 dentro del mismo owner
            $table->unique(['phoneable_type', 'phoneable_id', 'e164'], 'phones_owner_e164_unique');

            // 1) Recuperar rápidamente el principal de un owner
            $table->index(['phoneable_type', 'phoneable_id', 'is_primary'], 'phones_owner_primary_idx');

            // 2) Filtrar por tipo dentro de un owner (móviles de una empresa/sede)
            $table->index(['phoneable_type', 'phoneable_id', 'type'], 'phones_owner_type_idx');

            // 3) Búsqueda global por e164 (¿dónde aparece este número?)
            $table->index('e164', 'phones_e164_idx');

            // 4) Opcionales: descomenta si filtras mucho por estas banderas
            // $table->index('is_verified', 'phones_verified_idx');
            // $table->index('is_whatsapp', 'phones_whatsapp_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::dropIfExists('phones');
    }
};
