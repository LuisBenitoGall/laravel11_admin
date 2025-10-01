<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();

            // Tutela: empresa "madre" opcional
            $table->foreignId('mother_co')
                  ->nullable()
                  ->constrained('companies')
                  ->nullOnDelete(); // si se borra la madre, se elimina la tutela

            $table->string('mother_co_num')->nullable();

            $table->boolean('is_community')->default(false);
            $table->string('name');
            $table->string('slug');                      // no único por requisito
            $table->string('tradename')->nullable();
            $table->string('acronym')->nullable();
            $table->string('logo')->nullable();
            $table->string('nif')->nullable()->unique(); // único global; NULLs permitidos

            $table->boolean('is_ute')->default(false);
            $table->dateTime('ute_start_at')->nullable();
            $table->dateTime('ute_finish_at')->nullable();

            $table->tinyInteger('status')->default(1);   // 0/1
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->constrained('users')->restrictOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Índices útiles para búsquedas y filtros
            $table->index('status', 'companies_status_index');
            $table->index('deleted_at', 'companies_deleted_at_index');
            $table->index('name', 'companies_name_index');
            $table->index('tradename', 'companies_tradename_index');
            $table->index('slug', 'companies_slug_index');             // típico lookup por slug
            $table->index('mother_co', 'companies_mother_co_index');
            $table->index(['mother_co', 'mother_co_num'], 'companies_mother_pair_index');
        });

        // Check opcional para status 0/1 (si el motor lo permite)
        try {
            DB::statement("ALTER TABLE companies ADD CONSTRAINT chk_companies_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {
            // Ignorar si el motor no soporta CHECK o si ya existe
        }
    }

    public function down(): void {
        try { DB::statement("ALTER TABLE companies DROP CONSTRAINT chk_companies_status"); } catch (\Throwable $e) {}

        Schema::dropIfExists('companies');
    }
};
