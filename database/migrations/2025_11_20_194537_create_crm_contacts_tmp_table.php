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
        Schema::create('crm_contacts_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('external_id', 64)->nullable();
            $table->string('email')->nullable();
            $table->string('company_name')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('status')->nullable();
            $table->string('user_name')->nullable();
            $table->string('surname')->nullable();
            $table->string('last_year_service')->nullable();
            $table->string('cost_center')->nullable();
            $table->string('department')->nullable();
            $table->text('description')->nullable();
            $table->string('address1')->nullable();
            $table->string('address1_street1')->nullable();
            $table->string('address1_street2')->nullable();
            $table->string('address1_street3')->nullable();
            $table->string('city1')->nullable();
            $table->string('cp1')->nullable();
            $table->string('province1')->nullable();
            $table->string('country1')->nullable();
            $table->string('currency')->nullable();
            $table->dateTime('created_date')->nullable();
            $table->string('owner')->nullable();
            $table->string('position')->nullable();
            $table->string('responsable')->nullable();
            $table->string('sex')->nullable();
            $table->string('mobile')->nullable();
            $table->string('phone_private1')->nullable();
            $table->string('contact_type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_contacts_tmp');
    }
};
