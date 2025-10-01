<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    public function up(): void{
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();

            // Empresa (1:1 lógico con histórico por soft delete)
            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            // Moneda (se pone a NULL si borran la divisa)
            $table->foreignId('currency_id')
                  ->nullable()
                  ->constrained('currencies')
                  ->nullOnDelete();

            // Flags
            $table->boolean('customers_management')->default(false);
            $table->boolean('providers_management')->default(false);
            $table->boolean('validate_nif')->default(true);

            // Colores base (dejo string por flexibilidad)
            $table->string('primary_color')->nullable();
            $table->string('secondary_color')->nullable();
            $table->string('base_color_budgets')->nullable();
            $table->string('base_color_orders')->nullable();
            $table->string('base_color_invoices')->nullable();

            // Impuestos y otros
            $table->decimal('iva', 5, 2)->nullable();
            $table->string('ip', 45)->nullable();     // IPv4/IPv6

            // Estructurados
            $table->json('emails')->nullable();
            $table->json('public_info')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // Unicidad por empresa (permitiendo recrear tras soft delete)
            $table->unique(['company_id','deleted_at'], 'company_settings_company_deleted_unique');

            // Índices útiles
            $table->index('company_id', 'company_settings_company_id_index');
            $table->index('currency_id', 'company_settings_currency_id_index');
            $table->index('deleted_at', 'company_settings_deleted_at_index');
        });
    }

    public function down(): void{
        Schema::dropIfExists('company_settings');
    }
};
