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
        Schema::table('marketing_campaigns', function (Blueprint $table) {
            // Sistema origen (por si algún día hay más de uno)
            $table->string('source_system', 50)
                ->nullable()
                ->after('external_id');

            // Tipo técnico de campaña en el sistema origen
            // p.ej. 'campaign', 'quick_campaign', 'manual', etc.
            $table->string('source_type', 50)
                ->nullable()
                ->after('source_system')
                ->comment('Tipo de campaña en el sistema origen: campaign | quick_campaign | ...');

            // Flag de comodidad para filtrar campañas express
            $table->boolean('is_quick')
                ->default(false)
                ->after('source_type')
                ->comment('1 = campaña express (quick campaign); 0 = campaña normal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketing_campaigns', function (Blueprint $table) {
            $table->dropColumn(['source_system', 'source_type', 'is_quick']);
        });
    }
};
