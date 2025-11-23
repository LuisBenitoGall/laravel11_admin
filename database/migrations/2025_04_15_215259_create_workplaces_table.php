<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workplaces', function (Blueprint $table) {
            $table->id();

            $table->string('name', 191);
            $table->string('slug', 191);

            // Empresa (borra en cascada sus centros)
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Centro destacado por empresa
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

            // NIF informativo, sin paranoias de normalización
            $table->string('nif', 32)->nullable();

            $table->string('website', 191)->nullable();
            $table->text('description')->nullable();

            $table->boolean('status')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // Unicidad por empresa del slug (permitiendo recrear tras soft delete)
            $table->unique(
                ['company_id', 'slug', 'deleted_at'],
                'workplaces_company_slug_deleted_unique'
            );

            // Índices útiles
            $table->index('company_id', 'workplaces_company_id_index');
            $table->index('town_id',    'workplaces_town_id_index');
            $table->index('status',     'workplaces_status_index');
            $table->index('cp',         'workplaces_cp_index');
            $table->index('deleted_at', 'workplaces_deleted_at_index');
        });

        // Opcional: garantizar que solo haya UN featured=1 por company_id
        try {
            DB::statement("
                ALTER TABLE workplaces
                ADD COLUMN featured_company_id BIGINT UNSIGNED
                GENERATED ALWAYS AS (
                    CASE WHEN featured = 1 THEN company_id ELSE NULL END
                ) STORED
            ");

            DB::statement("
                ALTER TABLE workplaces
                ADD UNIQUE KEY workplaces_featured_one_per_company (featured_company_id)
            ");
        } catch (\Throwable $e) {
            // Si el motor no soporta columnas generadas, simplemente no se aplica
        }

        // CHECK opcional para status (0/1)
        try {
            DB::statement("
                ALTER TABLE workplaces
                ADD CONSTRAINT chk_workplaces_status
                CHECK (status IN (0,1))
            ");
        } catch (\Throwable $e) {
            // MySQL viejunos sin CHECK real, etc.
        }
    }

    public function down(): void
    {
        // Intentamos limpiar extras; que no reviente si no existen
        try {
            DB::statement("
                ALTER TABLE workplaces
                DROP CONSTRAINT chk_workplaces_status
            ");
        } catch (\Throwable $e) {}

        try {
            DB::statement("
                ALTER TABLE workplaces
                DROP INDEX workplaces_featured_one_per_company
            ");
        } catch (\Throwable $e) {}

        try {
            DB::statement("
                ALTER TABLE workplaces
                DROP COLUMN featured_company_id
            ");
        } catch (\Throwable $e) {}

        Schema::dropIfExists('workplaces');
    }
};
