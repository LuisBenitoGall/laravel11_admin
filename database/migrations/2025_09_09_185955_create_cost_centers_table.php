<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(){
        Schema::create('cost_centers', function (Blueprint $table) {
            $table->id();
            // FK:
            $table->unsignedBigInteger('company_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');

            $table->string('name');
            $table->string('slug');
            $table->integer('status')->default(1);
            $table->softDeletes();
            $table->timestamps();

            // Unicidad por empresa
            $table->unique(['company_id', 'slug']);
            $table->index(['company_id', 'name']);
        });
    }

    public function down(){
        Schema::dropIfExists('cost_centers');
    }
};
