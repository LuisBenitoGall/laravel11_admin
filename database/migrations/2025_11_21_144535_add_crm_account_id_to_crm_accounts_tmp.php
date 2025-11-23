<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('crm_accounts_tmp', function (Blueprint $table) {
            $table->unsignedBigInteger('crm_account_id')->nullable()->after('owner');
            // Si tienes tabla companies:
            $table->foreign('crm_account_id')
                ->references('id')->on('crm_accounts');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_accounts_tmp', function (Blueprint $table) {
            $table->dropColumn('crm_account_id');
        });
    }
};
