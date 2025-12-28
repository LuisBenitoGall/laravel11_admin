<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLinkedCompanyIndexesToCrmAccountsTable extends Migration
{
    public function up()
    {
        Schema::table('crm_accounts', function (Blueprint $table) {
            // Optimiza joins/búsquedas: ca.company_id = ? AND ca.linked_company_id = ?
            // y ayuda si filtras soft deletes (deleted_at IS NULL)
            $table->index(
                ['company_id', 'linked_company_id', 'deleted_at'],
                'crm_accounts_company_linked_deleted_index'
            );
        });
    }

    public function down()
    {
        Schema::table('crm_accounts', function (Blueprint $table) {
            $table->dropIndex('crm_accounts_company_linked_deleted_index');
        });
    }
}
