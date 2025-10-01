<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::table('users', function (Blueprint $table){
            $table->string('surname')->nullable()->after('name');
            $table->string('nickname')->nullable()->after('surname');
            $table->date('birthday')->nullable()->after('password');
            $table->string('nif')->nullable()->after('birthday');
            $table->string('signature')->nullable()->after('nif');
            $table->boolean('isAdmin')->default(false)->after('signature');
            $table->integer('status')->default(0)->after('isAdmin');
            $table->softDeletes()->after('remember_token');

            // Reemplazar UNIQUE(email) por UNIQUE(email, deleted_at)
            $table->dropUnique('users_email_unique');
            $table->unique(['email', 'deleted_at'], 'users_email_deleted_at_unique');

            // Índices y unicidades adicionales
            $table->index('surname', 'users_surname_index');
            $table->index('status', 'users_status_index');
            $table->index('deleted_at', 'users_deleted_at_index'); // acelera soft deletes
            $table->unique('nif', 'users_nif_unique'); // único y opcional
        });

        // CHECK constraint para status (si el motor lo permite, p.ej. MySQL 8+)
        try {
            DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_status CHECK (status IN (0,1))");
        } catch (\Throwable $e) {
            // Algunos motores/configs no soportan CHECK. No pasa nada si falla.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        // Quitar índices/uniques nuevos y restaurar UNIQUE(email)
        try { DB::statement("ALTER TABLE users DROP CONSTRAINT chk_users_status"); } catch (\Throwable $e) {}

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_deleted_at_unique');
            $table->dropIndex('users_surname_index');
            $table->dropIndex('users_status_index');
            $table->dropIndex('users_deleted_at_index');
            $table->dropUnique('users_nif_unique');

            $table->unique('email', 'users_email_unique');
        });
        
        Schema::table('users', function (Blueprint $table){
            $table->dropColumn(['surname', 'nickname', 'birthday', 'nif', 'signature', 'isAdmin', 'status', 'deleted_at']);
        });
    }
};
