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
        Schema::table('crm_contacts_tmp', function (Blueprint $table) {
            $table->unsignedBigInteger('crm_account_id')->nullable()->after('company_name');
            $table->string('normalized_company_name', 255)->nullable()->after('company_name');
            $table->string('match_status', 20)->nullable()->after('crm_account_id'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_contacts_tmp', function (Blueprint $table) {
            $table->dropColumn(['crm_account_id', 'normalized_company_name', 'match_status']);
        });
    }
};
