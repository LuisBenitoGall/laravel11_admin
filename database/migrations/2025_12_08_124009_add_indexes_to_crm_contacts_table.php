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
            // Índice para consultas por company_id + user_id
            $table->index(
                ['company_id', 'user_id'],
                'idx_crm_contacts_company_user'
            );

            // Índice para leads: company_id + contact_type + user_id
            $table->index(
                ['company_id', 'contact_type', 'user_id'],
                'idx_crm_contacts_company_type_user'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropIndex('idx_crm_contacts_company_user');
            $table->dropIndex('idx_crm_contacts_company_type_user');
        });
    }
};
