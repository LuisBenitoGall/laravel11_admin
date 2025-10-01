<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('workplaces', function (Blueprint $table){
            $table->id();

            $table->string('name', 191);
            $table->string('slug', 191);

            // Empresa (borra en cascada sus centros)
            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            // Solo puede haber un featured=1 por empresa (ver columna generada abajo)
            $table->boolean('featured')->default(false);

            $table->string('logo', 191)->nullable();
            $table->string('address', 191)->nullable();

            // Código postal
            $table->string('cp', 12)->nullable();

            // Localidad (no se nullifica; impide borrar si está referenciada)
            $table->foreignId('town_id')
                  ->nullable()
                  ->constrained('towns')
                  ->restrictOnDelete();

            // NIF único normalizado (ver columna generada abajo)
            $table->string('nif', 32)->nullable();

            $table->string('website', 191)->nullable();
            $table->text('description')->nullable();

            $table->boolean('status')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // Unicidad por empresa del slug (permitiendo recrear tras soft delete)
            $table->unique(['company_id','slug','deleted_at'], 'workplaces_company_slug_deleted_unique');

            // Índices útiles
            $table->index('company_id', 'workplaces_company_id_index');
            $table->index('town_id',    'workplaces_town_id_index');
            $table->index('status',     'workplaces_status_index');
            $table->index('cp',         'workplaces_cp_index');
            $table->index('deleted_at', 'workplaces_deleted_at_index');
        });

        // Columna generada para ENFORZAR que solo haya un featured=1 por company
        // y columna generada para NIF normalizado y UNIQUE sobre ella.
        try {
            // 1) featured único por empresa
            DB::statement("
                ALTER TABLE workplaces
                ADD COLUMN featured_company_id BIGINT UNSIGNED
                GENERATED ALWAYS AS (CASE WHEN featured = 1 THEN company_id ELSE NULL END) STORED
            ");
            DB::statement("
                ALTER TABLE workplaces
                ADD UNIQUE KEY workplaces_featured_one_per_company (featured_company_id)
            ");

            // 2) NIF normalizado (A-Z0-9) en mayúsculas y UNIQUE
            // Requiere MySQL 8.0 (REGEXP_REPLACE)
            DB::statement("
                ALTER TABLE workplaces
                ADD COLUMN nif_norm VARCHAR(32)
                GENERATED ALWAYS AS (UPPER(REGEXP_REPLACE(COALESCE(nif,''), '[^0-9A-Z]+', ''))) STORED
            ");
            DB::statement("
                ALTER TABLE workplaces
                ADD UNIQUE KEY workplaces_nif_norm_unique (nif_norm)
            ");
        } catch (\Throwable $e) {
            // Si tu motor no soporta columnas generadas/regex, avísame y te doy alternativa por app.
        }

        // CHECK opcional de status
        try {
            DB::statement("ALTER TABLE workplaces ADD CONSTRAINT chk_workplaces_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE workplaces DROP CONSTRAINT chk_workplaces_status"); } catch (\Throwable $e) {}
        // Limpia índices/cols generadas si existen
        try { DB::statement("ALTER TABLE workplaces DROP INDEX workplaces_featured_one_per_company"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE workplaces DROP COLUMN featured_company_id"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE workplaces DROP INDEX workplaces_nif_norm_unique"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE workplaces DROP COLUMN nif_norm"); } catch (\Throwable $e) {}

        Schema::dropIfExists('workplaces');
    }
};
