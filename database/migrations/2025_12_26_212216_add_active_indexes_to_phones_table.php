<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddActiveIndexesToPhonesTable extends Migration
{
    public function up()
    {
        Schema::table('phones', function (Blueprint $table) {
            // Para queries típicas de relación polimórfica con SoftDeletes:
            $table->index(
                ['phoneable_type', 'phoneable_id', 'deleted_at'],
                'phones_owner_deleted_at_index'
            );

            // Para "dame el teléfono principal" ignorando soft-deleted:
            $table->index(
                ['phoneable_type', 'phoneable_id', 'deleted_at', 'is_primary'],
                'phones_owner_deleted_primary_index'
            );
        });
    }

    public function down()
    {
        Schema::table('phones', function (Blueprint $table) {
            $table->dropIndex('phones_owner_deleted_at_index');
            $table->dropIndex('phones_owner_deleted_primary_index');
        });
    }
}
