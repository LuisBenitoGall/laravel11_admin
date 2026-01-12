<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();

            // Multiempresa: empresa a la que pertenece la agenda
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Propietario de la agenda
            $table->foreignId('owner_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Datos de la agenda
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('color', 7)->nullable(); // Formato #RRGGBB
            $table->boolean('status')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // Índices
            $table->index('company_id', 'schedules_company_id_index');
            $table->index('owner_id', 'schedules_owner_id_index');
            $table->index('status', 'schedules_status_index');
            
            // Opcional: unicidad por empresa+owner+name (evitar duplicados obvios)
            // Comentado porque puede ser restrictivo, descomentar si se necesita
            // $table->unique(['company_id', 'owner_id', 'name', 'deleted_at'], 'schedules_company_owner_name_unique');
        });
    }

    public function down(): void {
        Schema::dropIfExists('schedules');
    }
};
