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
        Schema::create('crm_marketing_lists_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('external_id', 64)->nullable();
            $table->string('list_name')->nullable();
            $table->string('type')->nullable();
            $table->string('tipo_integrante_lista')->nullable();
            $table->dateTime('last_use')->nullable();
            $table->string('author')->nullable();
            $table->dateTime('created_date')->nullable();
            $table->integer('num_members')->nullable();
            $table->string('owner')->nullable();
            $table->unsignedBigInteger('list_id')->nullable();
            $table->foreign('list_id')
                ->references('id')->on('marketing_lists');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_marketing_lists_tmp');
    }
};
