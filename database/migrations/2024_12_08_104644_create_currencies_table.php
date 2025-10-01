<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();

            $table->string('name', 191);
            $table->string('slug', 191)->unique();     // único
            $table->char('code', 3)->unique();         // ISO 4217 alpha
            $table->char('number', 3)->nullable();     // ISO 4217 numérico (históricas pueden venir vacías)
            $table->string('symbol', 8)->nullable();   // R$, HK$, zł, etc.
            $table->boolean('status')->default(true);

            $table->softDeletes();
            $table->timestamps();

            // Índices
            $table->index('name', 'currencies_name_index');
            $table->index('number', 'currencies_number_index');     // ya no es UNIQUE
            $table->index('status', 'currencies_status_index');
            $table->index('deleted_at', 'currencies_deleted_at_index');
        });

        // Opcional: CHECK si tu motor lo soporta
        try {
            DB::statement("ALTER TABLE currencies ADD CONSTRAINT chk_currencies_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {
            // MySQL viejuno o SQLite en tests: sin drama
        }
    }

    public function down(): void {
        try { DB::statement("ALTER TABLE currencies DROP CONSTRAINT chk_currencies_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('currencies');
    }
};
