<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('slug', 191)->unique();      // para URLs/filters
            $table->string('code', 3)->nullable()->unique();   // ISO num o interno
            $table->char('alfa2', 2)->nullable()->unique();
            $table->char('alfa3', 3)->nullable()->unique();
            $table->string('flag', 191)->nullable();
            $table->boolean('status')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index('name', 'countries_name_index');
            $table->index('status', 'countries_status_index');
            $table->index('deleted_at', 'countries_deleted_at_index');
        });

        try { DB::statement("ALTER TABLE countries ADD CONSTRAINT chk_countries_status CHECK (status IN (0,1))"); } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE countries DROP CONSTRAINT chk_countries_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('countries');
    }
};
