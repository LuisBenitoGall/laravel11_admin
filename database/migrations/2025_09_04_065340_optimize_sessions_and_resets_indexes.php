<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    public function up(): void{
        // Purga de tokens más barata
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->index('created_at', 'password_reset_tokens_created_at_index');
        });

        // Consultas "quién está conectado" y pruning más barato
        Schema::table('sessions', function (Blueprint $table) {
            $table->index(['user_id','last_activity'], 'sessions_user_last_activity_index');
        });
    }

    public function down(): void{
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropIndex('password_reset_tokens_created_at_index');
        });
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropIndex('sessions_user_last_activity_index');
        });
    }
};
