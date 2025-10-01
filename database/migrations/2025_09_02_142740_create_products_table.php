<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Ámbito por empresa
            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            $table->string('name', 191)->nullable();
            $table->string('slug', 191)->nullable();        // único por empresa (vivo)
            $table->string('ref', 191)->nullable();         // referencia interna
            $table->string('manual_ref', 191)->nullable();  // referencia del usuario

            $table->char('type', 1)->nullable();            // 'p' = producto, 's' = servicio

            // Etiquetas e i18n
            $table->json('tags')->nullable();

            $table->text('description')->nullable();
            $table->longText('long_description')->nullable();

            // Porcentajes: decimales, no floats
            $table->decimal('calculated_by_percent', 5, 2)->nullable(); // 0–100
            $table->decimal('iva', 5, 2)->nullable();                   // 0–100 (o enlaza a iva_types si quieres)

            $table->boolean('batch')->default(false);
            $table->boolean('stock_management')->default(false);
            $table->boolean('on_sale')->default(true);

            $table->unsignedSmallInteger('production_status')->nullable();

            $table->boolean('status')->default(false);

            // Autoría (sin cascade: preservamos quién lo creó/actualizó)
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->constrained('users');

            $table->softDeletes();
            $table->timestamps();

            // Unicidad por empresa compatible con SoftDeletes
            $table->unique(['company_id','slug','deleted_at'],       'prod_company_slug_deleted_unique');
            $table->unique(['company_id','ref','deleted_at'],        'prod_company_ref_deleted_unique');
            $table->unique(['company_id','manual_ref','deleted_at'], 'prod_company_manualref_deleted_unique');

            // Índices para filtros comunes
            $table->index(['company_id','name'],          'prod_company_name_index');
            $table->index(['company_id','type'],          'prod_company_type_index');
            $table->index(['company_id','status'],        'prod_company_status_index');
            $table->index(['company_id','on_sale'],       'prod_company_onsale_index');
            $table->index(['company_id','stock_management'],'prod_company_stockmgmt_index');
            $table->index('deleted_at',                   'prod_deleted_at_index');
        });

        // CHECKs opcionales (si tu motor los soporta)
        try {
            DB::statement("ALTER TABLE products
                ADD CONSTRAINT chk_products_type CHECK (type IN ('p','s') OR type IS NULL)");
            DB::statement("ALTER TABLE products
                ADD CONSTRAINT chk_products_status CHECK (status IN (0,1))");
            DB::statement("ALTER TABLE products
                ADD CONSTRAINT chk_products_onsale CHECK (on_sale IN (0,1))");
            DB::statement("ALTER TABLE products
                ADD CONSTRAINT chk_products_batch CHECK (batch IN (0,1))");
            DB::statement("ALTER TABLE products
                ADD CONSTRAINT chk_products_stockmgmt CHECK (stock_management IN (0,1))");
            DB::statement("ALTER TABLE products
                ADD CONSTRAINT chk_products_calc_pct CHECK (calculated_by_percent IS NULL OR (calculated_by_percent >= 0 AND calculated_by_percent <= 100))");
            DB::statement("ALTER TABLE products
                ADD CONSTRAINT chk_products_iva CHECK (iva IS NULL OR (iva >= 0 AND iva <= 100))");
        } catch (\Throwable $e) {
            // Si no hay CHECKs, ya nos ocuparemos en la app.
        }
    }

    public function down(): void{
        // Limpieza defensiva
        try { DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_type"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_status"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_onsale"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_batch"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_stockmgmt"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_calc_pct"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_iva"); } catch (\Throwable $e) {}
        Schema::dropIfExists('products');
    }
};
