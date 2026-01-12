<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('schedule_events', function (Blueprint $table) {
            $table->id();

            // Multiempresa: denormalizado para scoping rápido
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Agenda a la que pertenece el evento
            $table->foreignId('schedule_id')
                ->constrained('schedules')
                ->cascadeOnDelete();

            // Usuario que creó el evento
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            // Datos del evento
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->boolean('all_day')->default(false);
            $table->string('status')->nullable(); // Opcional v1

            $table->softDeletes();
            $table->timestamps();

            // Índices para consultas eficientes
            $table->index('company_id', 'schedule_events_company_id_index');
            $table->index('schedule_id', 'schedule_events_schedule_id_index');
            $table->index('created_by', 'schedule_events_created_by_index');
            $table->index('starts_at', 'schedule_events_starts_at_index');
            $table->index('ends_at', 'schedule_events_ends_at_index');
            
            // Índice compuesto para consultas por rango y agenda
            $table->index(['schedule_id', 'starts_at', 'ends_at'], 'schedule_events_range_index');
        });
    }

    public function down(): void {
        Schema::dropIfExists('schedule_events');
    }
};
