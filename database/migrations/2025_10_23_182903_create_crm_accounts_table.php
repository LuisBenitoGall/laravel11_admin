<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void{
        Schema::create('crm_accounts', function (Blueprint $table) {
            $table->id();

            // Multiempresa: inquilino
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            // Jerarquía B2B
            $table->foreignId('parent_account_id')->nullable()
                ->constrained('crm_accounts')->nullOnDelete();

            // Enlaces con maestros existentes
            $table->foreignId('customer_provider_id')->nullable()
                ->constrained('customer_providers')->nullOnDelete();

            // Enlace a una de tus propias companies (cuando procede)
            $table->foreignId('linked_company_id')->nullable()
                ->constrained('companies')->nullOnDelete();

            // Datos de la cuenta (foto operativa en CRM)
            $table->string('name');                // razón social o nombre comercial visible en CRM
            $table->string('tradename')->nullable();
            $table->string('tax_id', 32)->nullable(); // NIF/VAT (único por company cuando no es null)
            $table->string('website')->nullable();

            // Preferencias monetarias (opcional)
            $table->foreignId('currency_id')->nullable()
                ->constrained('currencies')->nullOnDelete();

            // Propietario/Responsable comercial
            $table->foreignId('owner_id')->nullable()
                ->constrained('users')->nullOnDelete();

            // Direcciones mínimas (puedes normalizar a otra tabla si te apetece complicarte)
            $table->string('billing_street')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_state')->nullable();
            $table->string('billing_postal_code', 20)->nullable();
            $table->string('billing_country_code', 2)->nullable();

            $table->string('shipping_street')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_state')->nullable();
            $table->string('shipping_postal_code', 20)->nullable();
            $table->string('shipping_country_code', 2)->nullable();

            // Estado operativo de la cuenta
            $table->unsignedTinyInteger('status')->default(1); // 0=inactive, 1=active

            // Autoría (sin cascade: preservamos quién lo creó/actualizó)
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->constrained('users');

            $table->softDeletes();
            $table->timestamps();
            
            // Índices y unicidades
            $table->index(['company_id', 'owner_id']);
            $table->index(['company_id', 'status']);
            $table->index(['company_id', 'name']);
            $table->unique(['company_id', 'tax_id']); // MySQL permite múltiples NULL
        });
    }

    public function down(): void{
        Schema::dropIfExists('crm_accounts');
    }
};
