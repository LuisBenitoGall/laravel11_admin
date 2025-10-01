<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    public function up(): void{
        Schema::create('company_modules', function (Blueprint $table){
            $table->id();

            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            $table->foreignId('module_id')
                  ->constrained('modules')
                  ->cascadeOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Evita duplicados “activos” y permite reactivar tras soft delete
            $table->unique(
                ['company_id','module_id','deleted_at'],
                'company_modules_company_module_deleted_unique'
            );

            // Listados frecuentes
            $table->index('company_id', 'company_modules_company_id_index');
            $table->index('module_id',  'company_modules_module_id_index');
            $table->index('deleted_at', 'company_modules_deleted_at_index');
        });
    }

    public function down(): void{
        Schema::dropIfExists('company_modules');
    }
};
