<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void{
        Schema::create('customer_providers', function (Blueprint $table) {
            $table->id();

            // Relación dirigida entre empresas
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('provider_id');

            // Códigos legacy y custom
            $table->string('customer_old_code')->nullable();
            $table->string('provider_old_code')->nullable();
            $table->string('provider_code')->nullable(); // código que el cliente asigna a su proveedor
            $table->string('customer_code')->nullable(); // código que el proveedor asigna a su cliente

            // Observaciones por rol
            $table->text('customer_observations')->nullable();
            $table->text('provider_observations')->nullable();

            // Defaults de negocio (no contables)
            $table->unsignedBigInteger('payment_term_id')->nullable();
            $table->unsignedBigInteger('currency_id')->nullable();
            $table->unsignedBigInteger('default_cost_center_id')->nullable();
            $table->unsignedBigInteger('payment_method_id')->nullable();
            $table->string('invoice_delivery_method', 50)->nullable(); // p.ej. 'pdf_email', 'edi', 'paper'

            // Descuentos, riesgo y perfiles fiscales (siguen siendo negocio, no “cuentas”)
            $table->decimal('discount_rate', 8, 4)->nullable(); // 0.0000..100.0000
            $table->decimal('credit_limit', 14, 2)->nullable();
            $table->unsignedBigInteger('tax_profile_id')->nullable();
            $table->unsignedBigInteger('withholding_profile_id')->nullable();

            // Vigencias
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->boolean('is_active')->default(true);

            // Extensión controlada
            $table->json('settings')->nullable();

            // Auditoría y borrado lógico
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // FKs principales
            $table->foreign('customer_id')->references('id')->on('companies')->restrictOnDelete();
            $table->foreign('provider_id')->references('id')->on('companies')->restrictOnDelete();

            // FKs a catálogos (nullOnDelete para no romper histórico)
            $table->foreign('payment_term_id')->references('id')->on('payment_terms')->nullOnDelete();
            $table->foreign('currency_id')->references('id')->on('currencies')->nullOnDelete();
            $table->foreign('default_cost_center_id')->references('id')->on('cost_centers')->nullOnDelete();
            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->nullOnDelete();
            $table->foreign('tax_profile_id')->references('id')->on('tax_profiles')->nullOnDelete();
            $table->foreign('withholding_profile_id')->references('id')->on('withholding_profiles')->nullOnDelete();

            // FKs de auditoría
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();

            // Índices y unicidad lógica
            $table->unique(['customer_id', 'provider_id']);
            $table->index('customer_id');
            $table->index('provider_id');
            $table->index(['is_active', 'valid_from', 'valid_to']);
        });

        // Coherencia: evitar auto-relación (si el motor lo soporta)
        try {
            DB::statement('ALTER TABLE customer_providers ADD CONSTRAINT chk_customer_provider_diff CHECK (customer_id <> provider_id)');
        } catch (\Throwable $e) {
            // Si CHECK no aplica (hola, MySQL viejuno), se valida en Request/Model.
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_providers');
    }
};
