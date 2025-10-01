<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
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

            // Observaciones separadas por rol
            $table->text('customer_observations')->nullable();
            $table->text('provider_observations')->nullable();

            /* =============================
               Defaults de negocio mínimos
               ============================= */

            // Términos de pago: texto libre sencillo hasta que tengas catálogo
            $table->string('payment_terms_text', 255)->nullable();

            // Método de pago: código/alias temporal; ya migrarás a FK cuando exista
            $table->string('payment_method_code', 50)->nullable();

            // Moneda por defecto del precio/operación si quieres forzar una
            // Si no te convence aún, puedes eliminarla sin que nada se rompa.
            $table->unsignedBigInteger('default_currency_id')->nullable();

            // Centro de coste por defecto del LADO PROVEEDOR (ventas del provider)
            // Lo dejo explícito en el nombre para evitar discusiones.
            $table->unsignedBigInteger('default_cost_center_customer_id')->nullable();
            $table->unsignedBigInteger('default_cost_center_provider_id')->nullable();

            // Descuento base simple (para políticas complejas, ya habrá otra tabla)
            $table->decimal('discount_rate', 8, 4)->nullable(); // 0..100.0000

            // Riesgo/crédito snapshot a nivel relación
            $table->decimal('credit_limit', 14, 2)->nullable();

            // Método de envío de facturas
            $table->string('invoice_delivery_method', 50)->nullable(); // 'pdf_email','edi','paper', etc.

            // Extensión controlada para rarezas (validada por Request)
            $table->json('settings')->nullable();

            // Auditoría y borrado lógico (esto “cancela” la relación)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();

            /* ===== FKs solo a tablas reales ===== */
            $table->foreign('customer_id')->references('id')->on('companies')->restrictOnDelete();
            $table->foreign('provider_id')->references('id')->on('companies')->restrictOnDelete();

            $table->foreign('default_currency_id')->references('id')->on('currencies')->nullOnDelete();
            $table->foreign('default_cost_center_customer_id')->references('id')->on('cost_centers')->nullOnDelete();
            $table->foreign('default_cost_center_provider_id')->references('id')->on('cost_centers')->nullOnDelete();

            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();

            /* ===== Unicidad y rendimiento ===== */
            // Importante: incluir deleted_at para permitir recrear una relación cancelada
            $table->unique(['customer_id', 'provider_id', 'deleted_at']);
            $table->index('customer_id');
            $table->index('provider_id');
        });

        // Coherencia básica: evitar auto-relación (si el motor lo soporta)
        try {
            DB::statement('ALTER TABLE customer_providers
                ADD CONSTRAINT chk_customer_provider_diff
                CHECK (customer_id <> provider_id)');
        } catch (\Throwable $e) {
            // MySQL haciéndose el interesante con CHECK. Valida en Request/Model.
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_providers');
    }
};
