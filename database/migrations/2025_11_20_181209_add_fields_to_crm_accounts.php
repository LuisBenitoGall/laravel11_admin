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
            $table->string('external_id', 64)->nullable()->after('shipping_country_code');
            $table->string('main_phone')->nullable()->after('external_id');
            $table->string('main_contact')->nullable()->after('main_phone');
            $table->string('main_email')->nullable()->after('main_contact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_accounts', function (Blueprint $table) {
            $table->dropColumn(['external_id', 'main_telf', 'main_contact', 'main_email']);
        });
    }
};
