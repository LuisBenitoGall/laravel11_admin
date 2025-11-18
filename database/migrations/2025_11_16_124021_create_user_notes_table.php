<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    public function up(): void{
        Schema::create('user_notes', function (Blueprint $table) {
            $table->id();

            // Multiempresa
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Propietario de la nota
            $table->foreignId('owner_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Usuario objeto de la nota
            $table->foreignId('contact_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Contenido
            $table->string('title')->nullable();
            $table->text('body');

            // Tags libres (["cliente", "vip", "pendiente_llamada"])
            $table->json('tags')->nullable();

            // Relevancia 1–5 (baja–alta)
            $table->unsignedTinyInteger('relevance')->default(3);

            // Recordatorios
            $table->timestamp('remind_at')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();

            // Estado visual / gestión
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_archived')->default(false);
            
            $table->softDeletes();
            $table->timestamps();

            // Índices útiles
            $table->index(['company_id', 'contact_id']);
            $table->index(['company_id', 'owner_id']);
            $table->index(['remind_at']);
            $table->index(['relevance']);
        });
    }

    public function down(): void{
        Schema::dropIfExists('user_notes');
    }
};
