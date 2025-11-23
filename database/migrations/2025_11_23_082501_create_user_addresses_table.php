<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();

            // Usuario dueño de la dirección
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Alias de la dirección: "Casa", "Oficina", "Delegación Madrid", etc.
            $table->string('label', 100)->nullable();

            // Dirección principal
            $table->string('address', 255)->nullable();

            // Campo adicional: segunda línea de dirección, piso, puerta, escalera...
            $table->string('address_extra', 255)->nullable();

            // Código postal
            $table->string('cp', 10)->nullable();

            // Localidad (FK de towns)
            $table->foreignId('town_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Notas internas
            $table->text('observations')->nullable();

            // Dirección principal del usuario en esa empresa
            $table->boolean('is_main')->default(false);
            
            $table->softDeletes();
            $table->timestamps();

            // Para filtrar rápido por usuario
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
