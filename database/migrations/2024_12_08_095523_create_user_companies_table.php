<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_companies', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            $table->string('position', 150)->nullable();

            $table->softDeletes();
            $table->timestamps();

            // Evita duplicados “activos” y permite re-vincular tras soft delete
            $table->unique(
                ['user_id','company_id','deleted_at'],
                'user_companies_user_company_deleted_unique'
            );

            // Filtros frecuentes
            $table->index('user_id', 'user_companies_user_id_index');
            $table->index('company_id', 'user_companies_company_id_index');
            $table->index('deleted_at', 'user_companies_deleted_at_index');
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_companies');
    }
};
