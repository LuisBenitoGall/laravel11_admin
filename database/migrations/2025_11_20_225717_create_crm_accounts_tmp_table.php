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
        Schema::create('crm_accounts_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('external_id', 64)->nullable();
            $table->string('account_name')->nullable();
            $table->string('main_phone')->nullable();
            $table->string('city')->nullable();
            $table->string('main_contact')->nullable();
            $table->string('main_email')->nullable();
            $table->string('second_email')->nullable();
            $table->string('status')->nullable();
            $table->string('nif')->nullable();
            $table->string('primary_account')->nullable();
            $table->text('description')->nullable();
            $table->string('address1')->nullable();
            $table->string('address1_street1')->nullable();
            $table->string('address1_street2')->nullable();
            $table->string('cp1')->nullable();
            $table->string('province1')->nullable();
            $table->string('country1')->nullable();
            $table->string('currency')->nullable();
            $table->string('created_date')->nullable();
            $table->string('owner')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_accounts_tmp');
    }
};

