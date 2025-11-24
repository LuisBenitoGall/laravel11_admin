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
        Schema::create('crm_opportunities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');

            // Usuario que hace de contacto
            $table->unsignedBigInteger('user_id');
            // Cuenta de CRM a la que se vincula este contacto
            $table->unsignedBigInteger('crm_account_id')->nullable();

            // Usuario interno responsable del contacto (comercial / account manager)
            $table->unsignedBigInteger('owner_id')->nullable();

            // Observaciones libres
            $table->text('observations')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // Relaciones
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('crm_account_id')
                ->references('id')
                ->on('crm_accounts')
                ->onDelete('cascade');

            $table->foreign('owner_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_opportunities');
    }
};
