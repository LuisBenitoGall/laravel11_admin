<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('product_patterns', function (Blueprint $table) {
            $table->id();

            // Ámbito por empresa
            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            $table->string('name', 191);
            $table->string('slug', 191);
            $table->json('pattern');

            $table->boolean('status')->default(true);

            // Autoría (no cascades: guardamos quién lo creó/actualizó)
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->constrained('users');

            $table->softDeletes();
            $table->timestamps();

            // Unicidad por empresa compatible con SoftDeletes
            $table->unique(['company_id','slug','deleted_at'], 'pp_company_slug_deleted_unique');
            //$table->unique(['company_id','name','deleted_at'], 'pp_company_name_deleted_unique');
            $table->index(['company_id','name'], 'pp_company_name_index');

            // Índices útiles
            $table->index(['company_id','status'], 'pp_company_status_index');
            $table->index('deleted_at', 'pp_deleted_at_index');
        });

        // CHECKs opcionales
        try {
            DB::statement("ALTER TABLE product_patterns
                ADD CONSTRAINT chk_pp_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE product_patterns DROP CONSTRAINT chk_pp_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('product_patterns');
    }
};
