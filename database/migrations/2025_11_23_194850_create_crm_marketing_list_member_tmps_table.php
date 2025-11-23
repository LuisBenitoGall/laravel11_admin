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
        Schema::create('crm_marketing_list_members_tmp', function (Blueprint $table) {
            $table->id();

            // Referencia a la lista de marketing destino
            $table->unsignedBigInteger('marketing_list_id')->nullable();
            $table->foreign('marketing_list_id')
                ->references('id')
                ->on('marketing_lists')
                ->onDelete('cascade');

            // Campos mapeados desde los CSV (todos nullable, porque no siempre vienen)
            $table->string('email')->nullable();
            $table->string('company')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('status')->nullable();
            $table->string('surname')->nullable();
            $table->string('cost_center')->nullable();

            $table->string('address1')->nullable();
            $table->string('street1')->nullable();
            $table->string('street2')->nullable();
            $table->string('street3')->nullable();
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('cp')->nullable();
            $table->string('nif')->nullable();

            $table->dateTime('created_date')->nullable();

            $table->string('name')->nullable();
            $table->string('owner')->nullable();
            $table->string('position')->nullable();
            $table->string('department')->nullable();
            $table->string('sex', 10)->nullable();
            $table->string('mobile')->nullable();
            $table->string('private_phone1')->nullable();
            $table->date('birthday')->nullable();

            // Flag de control para el promote
            $table->boolean('is_done')
                ->default(false)
                ->comment('0: pendiente de promover, 1: ya pasado a producción');

            $table->timestamps();

            // Un índice útil: lista + email, para detectar duplicados fácilmente
            $table->index(['marketing_list_id', 'email'], 'mlm_tmp_list_email_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_marketing_list_members_tmp');
    }
};
