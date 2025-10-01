<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::create('modules', function (Blueprint $table){
            $table->id();
            $table->string('name', 191)->unique();
            $table->string('slug', 191)->unique();
            $table->string('label', 191);
            $table->string('color', 32)->nullable();
            $table->string('icon', 191)->nullable();

            // 1,2,3 (admin/basic/optional). tinyint + check
            $table->unsignedTinyInteger('level')->nullable(); //(*)

            // i18n/otros textos serializados en JSON
            $table->json('translations')->nullable();
            $table->longText('explanation')->nullable();

            // Boolean consistente
            $table->boolean('status')->default(false);

            // Autoría (nullable y permite null en inserts)
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Índices útiles
            $table->index('status', 'modules_status_index');
            $table->index('level',  'modules_level_index');
            $table->index('deleted_at', 'modules_deleted_at_index');
        });

        try {
            DB::statement("ALTER TABLE modules ADD CONSTRAINT chk_modules_status CHECK (status IN (0,1))");
            DB::statement("ALTER TABLE modules ADD CONSTRAINT chk_modules_level CHECK (level IS NULL OR level BETWEEN 1 AND 3)");
        } catch (\Throwable $e) {}
    }

    /**
     * (*) Level determina los siguientes casos:
     * 1: Módulos exclusivos del Administrador, sin acceso de los usuarios.
     * 2: Módulos básicos, presentes en cualquier instalación.
     * 3: Módulos opcionales.
     */

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        try { DB::statement("ALTER TABLE modules DROP CONSTRAINT chk_modules_status"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE modules DROP CONSTRAINT chk_modules_level"); } catch (\Throwable $e) {}
        Schema::dropIfExists('modules');
    }
};
