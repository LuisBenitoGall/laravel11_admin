<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::create('product_docs', function (Blueprint $table) {
            $table->id();

            $table->string('doc');                  // ruta/filename del documento

            // FK producto (si se borra el producto, cascada tiene sentido para adjuntos)
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->cascadeOnDelete();

            $table->string('type', 64)->nullable(); // p.ej. 'manual','datasheet','foto'
            $table->boolean('featured')->default(false);

            // Autoría: conservar siempre quién lo creó (sin cascade)
            $table->foreignId('created_by')->constrained('users');

            $table->softDeletes();
            $table->timestamps();

            // Índices prácticos
            $table->index(['product_id','type'], 'pd_product_type_index');
            $table->index(['product_id','featured'], 'pd_product_featured_index');
            $table->index('created_by', 'pd_created_by_index');
            $table->index('deleted_at', 'pd_deleted_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::dropIfExists('product_docs');
    }
};
