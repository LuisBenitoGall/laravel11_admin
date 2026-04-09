<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Permite notas de usuario sin empresa (contactos no vinculados a ninguna company).
     */
    public function up(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE user_notes MODIFY company_id BIGINT UNSIGNED NULL');
        }

        Schema::table('user_notes', function (Blueprint $table) {
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            $firstCompanyId = DB::table('companies')->orderBy('id')->value('id');
            if ($firstCompanyId) {
                DB::table('user_notes')->whereNull('company_id')->update(['company_id' => $firstCompanyId]);
            }
            DB::statement('ALTER TABLE user_notes MODIFY company_id BIGINT UNSIGNED NOT NULL');
        }

        Schema::table('user_notes', function (Blueprint $table) {
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->cascadeOnDelete();
        });
    }
};
