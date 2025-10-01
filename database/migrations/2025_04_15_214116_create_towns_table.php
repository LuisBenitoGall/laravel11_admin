<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('towns', function (Blueprint $table) {
            $table->id();
            $table->string('name',191);
            $table->string('slug',191); // único por provincia
            $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
            $table->boolean('status')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['province_id','slug','deleted_at'], 'towns_province_slug_deleted_unique');
            $table->index('province_id', 'towns_province_id_index');
            $table->index('status', 'towns_status_index');
            $table->index('deleted_at', 'towns_deleted_at_index');
            $table->index('name', 'towns_name_index');
        });

        try { DB::statement("ALTER TABLE towns ADD CONSTRAINT chk_towns_status CHECK (status IN (0,1))"); } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE towns DROP CONSTRAINT chk_towns_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('towns');
    }
};
