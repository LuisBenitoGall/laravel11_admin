<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::table('accounting_account_usages', function (Blueprint $table) {
            // 1) Quitar el índice único antiguo (ajusta el nombre si difiere)
            $table->dropUnique('acc_usage_company_usage_context_unique');

            // 2) Crear uno nuevo incluyendo side (sin depender de la columna generada)
            $table->unique(
                ['company_id','usage_code','context_type','context_id','side'],
                'acc_usage_company_usage_context_side_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::table('accounting_account_usages', function (Blueprint $table) {
            // Revertir: eliminar el índice con side y volver al anterior
            $table->dropUnique('acc_usage_company_usage_context_side_unique');

            $table->unique(
                ['company_id','usage_code','context_type','context_id'],
                'acc_usage_company_usage_context_unique'
            );
        });
    }
};
