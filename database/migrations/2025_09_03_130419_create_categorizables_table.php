<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::create('categorizables', function (Blueprint $table) {
            // Ámbito
            $table->unsignedBigInteger('company_id');

            // Categoría
            $table->unsignedBigInteger('category_id');

            // Destino polimórfico
            $table->string('categorizable_type');
            $table->unsignedBigInteger('categorizable_id');

            // Extra opcional (principal, orden, notas…)
            $table->json('extra')->nullable();

            // Solo fecha de alta (no soft deletes para evitar duplicados “fantasma”)
            $table->timestamp('created_at')->useCurrent();

            // Índices
            $table->index(['categorizable_type','categorizable_id'], 'categorizables_morph_index');
            $table->index('category_id');
            $table->index('company_id');

            // Opcional: evita asignar la misma categoría **dos veces** al mismo registro
            $table->unique(['category_id','categorizable_type','categorizable_id'], 'categorizables_unique');

            // FKs simples (valida en código que company_id == category->company_id)
            $table->foreign('company_id')->references('id')->on('companies')
                ->cascadeOnUpdate()->cascadeOnDelete();

            $table->foreign('category_id')->references('id')->on('categories')
                ->cascadeOnUpdate()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::table('categorizables', function (Blueprint $table) {
            $table->dropUnique('categorizables_unique');
            $table->dropIndex('categorizables_morph_index');
            $table->dropIndex(['category_id']);
            $table->dropIndex(['company_id']);
            $table->dropForeign(['company_id']);
            $table->dropForeign(['category_id']);
        });
        
        Schema::dropIfExists('categorizables');
    }
};
