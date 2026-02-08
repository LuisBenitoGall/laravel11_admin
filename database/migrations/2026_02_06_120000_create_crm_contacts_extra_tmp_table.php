<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla temporal para importación de datos adicionales de contactos desde CSV Dynamics.
     * Cabeceras CSV: email, name, surname, cost_center, department, email2, email3, nif,
     * position, phone1, phone2, phone3, contact_type, business_type.
     */
    public function up(): void
    {
        Schema::create('crm_contacts_extra_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('email')->nullable();
            $table->string('name')->nullable();
            $table->string('surname')->nullable();
            $table->string('cost_center')->nullable();
            $table->string('department')->nullable();
            $table->string('email2')->nullable();
            $table->string('email3')->nullable();
            $table->string('nif')->nullable();
            $table->string('position')->nullable();
            $table->string('phone1')->nullable();
            $table->string('phone2')->nullable();
            $table->string('phone3')->nullable();
            $table->string('contact_type')->nullable();
            $table->string('business_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_contacts_extra_tmp');
    }
};
