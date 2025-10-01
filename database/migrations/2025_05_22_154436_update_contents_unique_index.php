<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::table('contents', function (Blueprint $table) {
            // 1) Soltar el índice único que existe
            $table->dropUnique('contents_code_unique');

            // 2) Añadir el índice compuesto
            $table->unique(['code', 'deleted_at'], 'contents_code_del_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::table('contents', function (Blueprint $table) {
            //
        });
    }
};
