<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla temporal para importación de last_year_service desde contacts_year_service.csv.
     * Cabeceras CSV: name, surname, email, service_last_year.
     */
    public function up(): void
    {
        Schema::create('crm_contacts_year_service_tmp', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('surname')->nullable();
            $table->string('email')->nullable();
            $table->integer('service_last_year')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_contacts_year_service_tmp');
    }
};
