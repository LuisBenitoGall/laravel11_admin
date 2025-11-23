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
        Schema::create('marketing_list_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketing_list_id')
                ->constrained('marketing_lists')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->text('observations')->nullable();

            $table->boolean('status')
                ->default(true);

            $table->timestamps();

            // Un usuario no debería estar dos veces en la misma lista
            $table->unique(
                ['marketing_list_id', 'user_id'],
                'marketing_list_users_list_user_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_list_users');
    }
};
