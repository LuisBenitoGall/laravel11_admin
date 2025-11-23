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
        Schema::create('crm_marketing_campaigns_tmp', function (Blueprint $table) {
            $table->id();
            // GUID original de Dynamics
            $table->string('external_id', 64)->nullable();

            // Datos básicos de campaña
            $table->string('name')->nullable();
            $table->string('status_reason')->nullable();

            // Fechas
            $table->dateTime('created_date')->nullable();
            $table->dateTime('start_at')->nullable();
            $table->dateTime('finish_at')->nullable();

            // Costes
            $table->decimal('total_cost', 15, 2)->nullable();

            // Códigos
            $table->string('campaign_code')->nullable();
            $table->string('promote_code')->nullable();

            // Descripción
            $table->text('description')->nullable();

            // Moneda (normalmente código tipo "EUR")
            $table->string('currency', 10)->nullable();

            // Autor / propietario textual (lo mapearemos luego a users)
            $table->string('author')->nullable();
            $table->string('owner')->nullable();

            // Tipo de campaña y centro de coste, tal cual vienen del CSV
            $table->string('campaign_type')->nullable();
            $table->string('cost_center')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_marketing_campaigns_tmp');
    }
};
