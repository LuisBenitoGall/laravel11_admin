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
        Schema::table('company_settings', function (Blueprint $table) {
            $table->char('language', 2)->nullable()->after('currency_id');
            $table->boolean('require_2fa')->default(false)->after('providers_management');
            $table->boolean('public_catalogue')->default(false)->after('emails');
            // Nº de dígitos para cuentas contables (p.ej. 11). TinyInteger sobra y cabe.
            $table->unsignedTinyInteger('accounting_account_digits')->default(11)->after('public_catalogue');

            // Numeración por patrones: si false, se numera con el id.
            $table->boolean('pattern_budgets')->default(false)->after('accounting_account_digits');
            $table->boolean('pattern_sales')->default(false)->after('pattern_budgets');
            $table->boolean('pattern_purchases')->default(false)->after('pattern_sales');
            $table->boolean('pattern_deliveries')->default(false)->after('pattern_purchases');
            $table->boolean('pattern_projects')->default(false)->after('pattern_deliveries');
            $table->boolean('pattern_invoices')->default(false)->after('pattern_projects');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['language', 'require_2fa', 'public_catalogue', 'accounting_account_digits', 'pattern_budgets', 'pattern_sales', 'pattern_purchases', 'pattern_deliveries', 'pattern_projects', 'pattern_invoices']);
        });
    }
};
