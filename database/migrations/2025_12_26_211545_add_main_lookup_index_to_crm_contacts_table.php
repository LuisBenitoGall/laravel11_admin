<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMainLookupIndexToCrmContactsTable extends Migration
{
    public function up()
    {
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->index(
                ['company_id', 'user_id', 'deleted_at', 'is_main', 'id'],
                'crm_contacts_company_user_deleted_main_id_index'
            );
        });
    }

    public function down()
    {
        Schema::table('crm_contacts', function (Blueprint $table) {
            $table->dropIndex('crm_contacts_company_user_deleted_main_id_index');
        });
    }
}
