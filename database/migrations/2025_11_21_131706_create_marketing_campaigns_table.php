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
        Schema::create('marketing_campaigns', function (Blueprint $table) {
            $table->id();

            // Responsable de la campaña
            $table->foreignId('owner_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Multiempresa
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Datos básicos
            $table->string('name');
            $table->string('campaign_code');
            $table->string('campaign_type', 50)->nullable();

            $table->text('description')->nullable();

            // Costes
            $table->decimal('total_cost', 15, 2)
                ->default(0);

            $table->decimal('expected_cost', 15, 2)
                ->nullable();

            // Moneda
            $table->foreignId('currency_id')
                ->nullable()
                ->constrained('currencies')
                ->nullOnDelete();

            // Código promocional asociado
            $table->string('promote_code')
                ->nullable();

            // Fechas de campaña
            $table->dateTime('start_at')
                ->nullable();

            $table->dateTime('finish_at')
                ->nullable();

            // Centro de coste
            $table->foreignId('cost_center_id')
                ->nullable()
                ->constrained('cost_centers')
                ->nullOnDelete();

            // Auditoría
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Estado de la campaña
            $table->unsignedTinyInteger('status')
                ->default(0)
                ->comment('0: draft, 1: active, 2: finished, 3: cancelled');

            // Enlace con sistemas externos (Dynamics & cia)
            $table->string('external_id')
                ->nullable()
                ->index();

            $table->timestamps();
            $table->softDeletes();

            // Evitar códigos de campaña duplicados dentro de la misma empresa
            $table->unique(
                ['company_id', 'campaign_code'],
                'marketing_campaigns_company_code_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_campaigns');
    }
};
