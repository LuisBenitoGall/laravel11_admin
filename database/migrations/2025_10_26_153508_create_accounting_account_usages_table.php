<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_account_usages', function (Blueprint $table) {
            $table->id();

            // Multiempresa
            $table->foreignId('company_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Cuenta contable
            $table->foreignId('account_id')
                ->constrained('accounting_accounts')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Código del tipo de uso (lo valida tu helper)
            $table->string('usage_code', 64);

            // Contexto polimórfico opcional
            $table->string('context_type')->nullable();   // p.ej. App\Models\Customer
            $table->unsignedBigInteger('context_id')->nullable();

            $table->boolean('is_default')->default(true);
            $table->text('notes')->nullable();

            $table->timestampsTz();
            $table->softDeletesTz();

            // Índices con nombres cortos
            $table->index(['company_id', 'usage_code'], 'acc_usage_company_usage_idx');
            $table->index(['company_id', 'context_type', 'context_id'], 'acc_usage_ctx_idx');
        });

        // Columna generada para unicidad por (empresa, uso, contexto)
        DB::statement("
            ALTER TABLE accounting_account_usages
            ADD COLUMN context_key VARCHAR(255)
                GENERATED ALWAYS AS (
                    IF(context_type IS NULL AND context_id IS NULL,
                       'GLOBAL',
                       CONCAT(COALESCE(context_type, ''), '#', COALESCE(context_id, 0))
                    )
                ) VIRTUAL
        ");

        // Unicidad: una fila por (empresa, uso, contexto)
        Schema::table('accounting_account_usages', function (Blueprint $table) {
            $table->unique(
                ['company_id', 'usage_code', 'context_key'],
                'acc_usage_company_usage_context_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_account_usages');
    }
};
