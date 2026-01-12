<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('schedule_user', function (Blueprint $table) {
            $table->id();

            // Relación pivot: schedule y user
            $table->foreignId('schedule_id')
                ->constrained('schedules')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Rol de acceso: owner|editor|viewer (gestionado por trait, no enum)
            $table->string('role')->required();

            $table->timestamps();

            // Índices
            $table->index('schedule_id', 'schedule_user_schedule_id_index');
            $table->index('user_id', 'schedule_user_user_id_index');
            
            // Unicidad: un usuario solo puede tener un rol por agenda
            $table->unique(['schedule_id', 'user_id'], 'schedule_user_schedule_user_unique');
        });
    }

    public function down(): void {
        Schema::dropIfExists('schedule_user');
    }
};
