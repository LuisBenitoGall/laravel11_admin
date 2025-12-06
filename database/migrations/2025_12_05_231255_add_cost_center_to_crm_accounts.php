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
        Schema::table('crm_accounts', function (Blueprint $table) {
            $table->unsignedBigInteger('cost_center_id')->nullable()->after('owner_id');
            // Si tienes tabla companies:
            $table->foreign('cost_center_id')
                ->references('id')->on('cost_centers');

            $table->integer('business_type')->nullable()->after('cost_center_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_accounts', function (Blueprint $table) {
            $table->dropColumn('cost_center_id', 'business_type');
        });
    }
};
