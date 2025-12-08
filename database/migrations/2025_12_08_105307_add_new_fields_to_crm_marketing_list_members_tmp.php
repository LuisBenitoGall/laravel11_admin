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
        Schema::table('crm_marketing_list_members_tmp', function (Blueprint $table) {
            $table->text('description')->nullable()->after('department');
            $table->string('contact_type')->nullable()->after('description');
            $table->string('contact_subtype')->nullable()->after('contact_type');
            $table->string('business_type')->nullable()->after('contact_subtype');
            $table->string('salutation')->nullable()->after('business_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_marketing_list_members_tmp', function (Blueprint $table) {
            $table->dropColumn(['description', 'contact_type', 'contact_subtype', 'business_type', 'salutation']);
        });
    }
};
