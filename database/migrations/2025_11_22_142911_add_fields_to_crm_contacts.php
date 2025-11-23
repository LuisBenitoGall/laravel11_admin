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
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->string('position')->nullable()->after('contact_type');
            $table->string('department')->nullable()->after('position');
            $table->string('cost_center')->nullable()->after('department');
            $table->integer('last_year_service')->nullable()->after('cost_center');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropColumn(['position', 'department', 'last_year_service']);
        });
    }
};
