<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191)->unique();   // maestro: nombre único global
            $table->string('slug', 191)->unique();   // y slug único global
            $table->text('description')->nullable();
            $table->decimal('rate', 9, 2)->default(0);
            $table->unsignedInteger('duration')->nullable(); // unidad: la que uses
            $table->boolean('status')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('status', 'accounts_status_index');
            $table->index('deleted_at', 'accounts_deleted_at_index');
        });

        // Opcional: CHECK status si tu motor lo soporta
        try {
            DB::statement("ALTER TABLE accounts ADD CONSTRAINT chk_accounts_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE accounts DROP CONSTRAINT chk_accounts_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('accounts');
    }
};
