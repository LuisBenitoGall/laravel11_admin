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
        Schema::table('crm_potential_customers_tmp', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('external_id');
            // Si tienes tabla companies:
            $table->foreign('user_id')
                ->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_potential_customers_tmp', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
    }
};
