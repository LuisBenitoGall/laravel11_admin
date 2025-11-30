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
        Schema::table('crm_opportunities', function (Blueprint $table) {
            $table->string('name')->nullable()->after('id');
            $table->decimal('estimated_revenue', 9, 2)->default(0)->after('observations');          //Previsión de ingresos
            $table->decimal('actual_revenue', 9, 2)->default(0)->after('estimated_revenue');        //Ingresos reales
            $table->string('engagement_level', 25)->default(0)->after('actual_revenue');            //Valoración
            $table->decimal('win_probability', 5, 2)->default(0)->after('engagement_level');        //Probabilidad de conversión
            $table->dateTime('expected_close_date')->nullable()->after('win_probability');  //Fecha estimada de cierre
            $table->text('lost_reason')->nullable()->after('expected_close_date');  //Motivo de la pérdida
            $table->integer('status')->default(1)->after('lost_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('crm_opportunities', function (Blueprint $table) {
            $table->dropColumn(['name', 'estimated_revenue', 'actual_revenue', 'engagement_level', 'win_probability', 'expected_close_date', 'lost_reason', 'status']);
        });
    }
};
