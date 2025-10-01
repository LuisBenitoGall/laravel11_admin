<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // Multiempresa
            $table->unsignedBigInteger('company_id');

            // Vinculación a módulo por slug (FK a modules.slug)
            $table->string('module', 64);

            // Jerarquía
            $table->unsignedBigInteger('parent_id')->nullable();

            // Datos
            $table->string('name')->nullable();
            $table->string('slug')->nullable();
            $table->text('translations')->nullable();

            // Árbol (materialized path)
            $table->string('path')->index();
            $table->unsignedInteger('depth')->default(0);
            $table->unsignedInteger('position')->default(0);

            $table->integer('status')->default(1);
            $table->softDeletes();
            $table->timestamps();

            // Unicidad: empresa + módulo + slug
            $table->unique(['company_id', 'module', 'slug'], 'cat_company_module_unique');

            // Índices típicos
            $table->index(['company_id', 'module', 'parent_id'], 'cat_company_module_parent_index');

            // FKs principales
            $table->foreign('company_id', 'cat_company_fk')
                ->references('id')->on('companies')
                ->onUpdate('cascade')->onDelete('cascade');

            $table->foreign('module', 'cat_module_fk')
                ->references('slug')->on('modules')
                ->onUpdate('cascade')->onDelete('restrict');

            // Soporte para FK de ámbito (debe existir unique sobre [company_id, module, id])
            $table->unique(['company_id', 'module', 'id'], 'cat_company_module_id_unique');

            // 1) Self-FK simple: permite descolgar hijos al borrar el padre
            $table->foreign('parent_id', 'cat_parent_id_fk')
                ->references('id')->on('categories')
                ->onUpdate('cascade')
                ->onDelete('set null');

            // 2) Self-FK de ámbito: el padre debe ser de la misma empresa y módulo
            $table->foreign(['company_id', 'module', 'parent_id'], 'cat_parent_scope_fk')
                ->references(['company_id', 'module', 'id'])
                ->on('categories')
                ->onUpdate('restrict')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::table('categories', function (Blueprint $table) {
            // Self-FKs (primero los que dependen del unique)
            $table->dropForeign('cat_parent_scope_fk');
            $table->dropForeign('cat_parent_id_fk');
            $table->dropUnique('cat_company_module_id_unique');

            // FKs a companies/modules
            $table->dropForeign('cat_module_fk');
            $table->dropForeign('cat_company_fk');

            // Uniques/Índices
            $table->dropUnique('cat_company_module_unique');
            $table->dropIndex('cat_company_module_parent_index');
            $table->dropIndex('categories_path_index'); // índice automático de 'path'
        });

        Schema::dropIfExists('categories');
    }
};
