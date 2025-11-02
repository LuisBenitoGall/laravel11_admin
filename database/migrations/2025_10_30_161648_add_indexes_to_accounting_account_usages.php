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
            $table->index(['company_id', 'context_type', 'context_id'], 'aau_ctx_idx');
            $table->index(['company_id', 'usage_code'], 'aau_usage_idx');
            $table->index(['company_id', 'usage_code', 'context_type'], 'aau_usage_ctx_idx');
            $table->index(['company_id', 'account_id'], 'aau_account_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::table('accounting_account_usages', function (Blueprint $table) {
            // Quita los índices por nombre, igual que los creaste
            $table->dropIndex('aau_ctx_idx');
            $table->dropIndex('aau_usage_idx');
            $table->dropIndex('aau_usage_ctx_idx');
            $table->dropIndex('aau_account_idx');
        });
    }
};
