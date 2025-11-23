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
        Schema::create('crm_contacts', function (Blueprint $table) {
            $table->id();

            // Multiempresa: empresa "propietaria" del registro CRM
            $table->unsignedBigInteger('company_id');

            // Usuario que hace de contacto
            $table->unsignedBigInteger('user_id');

            // Cuenta de CRM a la que se vincula este contacto
            $table->unsignedBigInteger('crm_account_id')->nullable();

            // Tipo de contacto (usar tamaño 4 por las claves del HasContactTypes)
            $table->char('contact_type', 4)->nullable();

            // Usuario interno responsable del contacto (comercial / account manager)
            $table->unsignedBigInteger('owner_id')->nullable();

            // Contacto principal de la cuenta
            $table->boolean('is_main')->default(false);

            // Estado del contacto (1 = activo, 0 = inactivo)
            $table->tinyInteger('status')->default(1);

            // Observaciones libres
            $table->text('observations')->nullable();

            $table->timestamps();
            $table->softDeletes();

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

            // Opcional: evita duplicar el mismo contacto con el mismo tipo dentro de la misma cuenta
            // $table->unique(['company_id', 'crm_account_id', 'user_id', 'contact_type'], 'crm_contact_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_contacts');
    }
};
