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
        Schema::create('crm_marketing_campaigns_express_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('external_id', 64)->nullable();

            // Datos básicos de campaña
            $table->string('name')->nullable();
            $table->integer('members_count')->default(0);
            $table->integer('send_ok')->default(0);
            $table->integer('send_ko')->default(0);
            $table->string('status_reason')->nullable();
            $table->dateTime('created_date')->nullable();
            $table->string('owner')->nullable();
            $table->string('action')->nullable();
            $table->string('priority')->nullable();
            $table->string('members_type')->nullable();
            $table->dateTime('finish_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_marketing_campaigns_express_tmp');
    }
};
