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
        Schema::create('marketing_campaign_lists', function (Blueprint $table) {
            $table->id();

            // Multiempresa
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Relación con campañas
            $table->foreignId('marketing_campaign_id')
                ->constrained('marketing_campaigns')
                ->cascadeOnDelete();

            // Relación con listas
            $table->foreignId('marketing_list_id')
                ->constrained('marketing_lists')
                ->cascadeOnDelete();

            // Datos útiles por vínculo campaña-lista
            $table->unsignedInteger('estimated_recipients')
                ->nullable(); // estimación previa

            $table->unsignedInteger('actual_recipients')
                ->nullable(); // recuento real usado/enviado

            $table->timestamps();
            $table->softDeletes();

            // Evitar duplicar la misma lista en la misma campaña dentro de una empresa
            $table->unique(
                ['company_id', 'marketing_campaign_id', 'marketing_list_id'],
                'mkt_camp_list_company_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_campaign_lists');
    }
};
