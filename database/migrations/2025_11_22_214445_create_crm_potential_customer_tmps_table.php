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
        Schema::create('crm_potential_customers_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('external_id', 64)->nullable();
            $table->string('name')->nullable();
            $table->string('surname')->nullable();
            $table->string('email')->nullable();
            $table->dateTime('created_date')->nullable();
            $table->string('owner')->nullable();
            $table->string('issue')->nullable();
            $table->string('status_reason')->nullable();
            $table->string('cp')->nullable();
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('interest_level')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_potential_customers_tmp');
    }
};
