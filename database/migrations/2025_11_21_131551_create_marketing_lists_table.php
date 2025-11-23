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
        Schema::create('marketing_lists', function (Blueprint $table) {
            $table->id();
            // Propietario de la lista (usuario responsable)
            $table->foreignId('owner_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Multiempresa
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Datos básicos
            $table->string('name');
            $table->string('slug');

            $table->text('observations')->nullable();

            // Estado (0: inactiva, 1: activa, ampliable si algún día te da por complicarte la vida)
            $table->unsignedTinyInteger('status')
                ->default(1)
                ->comment('0: inactive, 1: active');

            $table->string('type', 20)
                ->nullable(); // p.ej. "static", "dynamic", o tipos de negocio propios

            $table->boolean('is_dynamic')
                ->default(false); // por si hay listas basadas en reglas

            $table->unsignedInteger('members_count')
                ->default(0); // número de miembros (cacheado)

            $table->timestamp('last_used_at')
                ->nullable(); // última vez que se usó en campaña, segmentación, etc.

            // Auditoría por usuario
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            // Evitar duplicados de slug dentro de la misma empresa
            $table->unique(
                ['company_id', 'slug'],
                'marketing_lists_company_slug_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_lists');
    }
};
