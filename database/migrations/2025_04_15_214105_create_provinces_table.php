<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name',191);
            $table->string('slug',191); // único por país
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->boolean('status')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['country_id','slug','deleted_at'], 'provinces_country_slug_deleted_unique');
            $table->index('country_id', 'provinces_country_id_index');
            $table->index('status', 'provinces_status_index');
            $table->index('deleted_at', 'provinces_deleted_at_index');
            $table->index('name', 'provinces_name_index');
        });

        try { DB::statement("ALTER TABLE provinces ADD CONSTRAINT chk_provinces_status CHECK (status IN (0,1))"); } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE provinces DROP CONSTRAINT chk_provinces_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('provinces');
    }
};
