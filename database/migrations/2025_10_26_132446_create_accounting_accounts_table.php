<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::create('accounting_accounts', function (Blueprint $table) {
            $table->id();
            // Multiempresa y jerarquía
            $table->foreignId('company_id')
                ->constrained()               // -> references 'id' on 'companies'
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('code', 30);       // Código único por empresa (ej: 43000001)
            $table->string('name', 255);

            $table->unsignedTinyInteger('level')->nullable(); // denormalizado; recalculable
            $table->boolean('is_group')->default(false);      // true = agrupador, no postea

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('accounting_accounts')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            // Naturaleza y lado normal
            $table->enum('nature', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->enum('normal_side', ['debit', 'credit'])->nullable();

            // Operativa
            $table->decimal('opening_balance', 18, 2)->default(0); // solo para asiento de apertura
            $table->foreignId('currency_id')                       // nullable: usa divisa base de la empresa
                ->nullable()
                ->constrained('currencies')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->boolean('reconcile')->default(false); // conciliable (bancos, clientes, etc.)
            $table->boolean('blocked')->default(false);   // bloquea nuevos asientos
            $table->boolean('featured')->default(false);  // “principal” entre equivalentes

            $table->unsignedTinyInteger('status')->default(1); // 1=activo, 0=archivado
            $table->text('notes')->nullable();

            // Trazas (opcionales si existen users)
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
           
            $table->softDeletesTz();
            $table->timestampsTz();

            // Índices
            $table->unique(['company_id', 'code']);                  // código único por empresa
            $table->index(['company_id', 'parent_id']);              // árbol
            $table->index(['company_id', 'nature', 'is_group']);     // filtros frecuentes
            $table->index(['company_id', 'reconcile']);              // conciliables por empresa
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::dropIfExists('accounting_accounts');
    }
};
