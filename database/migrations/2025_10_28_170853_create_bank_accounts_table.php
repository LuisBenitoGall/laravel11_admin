<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();

            // Ámbito por empresa
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Cuenta contable (opcional)
            $table->foreignId('accounting_account_id')
                ->nullable()
                ->constrained('accounting_accounts')
                ->nullOnDelete();

            // Banco (catálogo de bancos)
            $table->foreignId('bank_id')
                ->constrained('banks')
                ->restrictOnDelete();

            // Identificadores de cuenta
            $table->string('iban', 34)->nullable();       // IBAN completo normalizado sin espacios
            $table->char('country_code', 4)->nullable();  // País + Digito Control
            $table->char('entity', 4)->nullable();        // España: entidad
            $table->char('office', 4)->nullable();        // España: oficina
            $table->char('dc', 2)->nullable();            // España: dígito control
            $table->char('digits', 10)->nullable();       // España: número de cuenta

            $table->boolean('featured')->default(false);  // cuenta principal de la empresa
            $table->boolean('status')->default(false);    // activa/inactiva

            // Campo generado para garantizar UNA featured por empresa
            // IF(featured = 1, company_id, NULL)
            $table->unsignedBigInteger('featured_company_id')
                ->nullable()
                ->virtualAs('IF(`featured` = 1, `company_id`, NULL)');

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->constrained('users')->restrictOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Unicidades
            $table->unique(['company_id', 'iban'], 'ba_company_iban_uq');
            $table->unique(['company_id', 'entity', 'office', 'dc', 'digits'], 'ba_company_esparts_uq');

            // Una sola featured por empresa
            $table->unique('featured_company_id', 'ba_one_featured_per_company');

            // Índices
            $table->index('company_id', 'ba_company_idx');
            $table->index(['company_id', 'status'], 'ba_company_status_idx');
            $table->index(['company_id', 'entity', 'office', 'dc', 'digits'], 'ba_company_parts_idx');
            $table->index('bank_id', 'ba_bank_idx');
            $table->index('iban', 'ba_iban_idx');
        });
    }

    public function down(): void {
        Schema::dropIfExists('bank_accounts');
    }
};
