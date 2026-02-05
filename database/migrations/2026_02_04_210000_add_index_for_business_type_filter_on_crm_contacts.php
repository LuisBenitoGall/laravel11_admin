<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Índice para filtro adhoc business_type en CRM contacts.
     */
    public function up(): void
    {
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->index(
                ['company_id', 'business_type', 'user_id'],
                'idx_crm_contacts_company_business_type_user'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropIndex('idx_crm_contacts_company_business_type_user');
        });
    }
};
