<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    public function up(): void{
        Schema::create('functionalities', function (Blueprint $table) {
            $table->id();

            $table->string('name', 191);
            $table->string('slug', 191);
            $table->string('label', 191)->nullable();

            // FK: si borras el módulo, vuelan sus funcionalidades
            $table->foreignId('module_id')
                  ->nullable()
                  ->constrained('modules')
                  ->cascadeOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Unicidad por módulo (permitiendo recrear tras soft delete)
            $table->unique(['module_id','slug','deleted_at'], 'functionalities_module_slug_deleted_unique');

            // Índices útiles para filtros/búsquedas
            $table->index('module_id',  'functionalities_module_id_index');
            $table->index('name',       'functionalities_name_index');
            $table->index('label',      'functionalities_label_index');
            $table->index('deleted_at', 'functionalities_deleted_at_index');
        });
    }

    public function down(): void{
        Schema::dropIfExists('functionalities');
    }
};

