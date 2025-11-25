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
        Schema::create('crm_contact_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('crm_contact_id');
            $table->string('title')->nullable();
            $table->text('message')->nullable();
            $table->string('origin')->nullable();
            $table->integer('status')->default(1);
            $table->softDeletes();
            $table->timestamps();

            // Relaciones
            $table->foreign('crm_contact_id')
                ->references('id')
                ->on('crm_contacts')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_contact_messages');
    }
};
