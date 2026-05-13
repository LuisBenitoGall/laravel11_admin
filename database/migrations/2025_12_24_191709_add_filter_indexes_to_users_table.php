<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    private function indexExists(string $table, string $indexName): bool
    {
        if (DB::getDriverName() === 'sqlite') {
            $result = DB::selectOne(
                "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = ?",
                [$indexName]
            );
            return (bool) $result;
        }

        $result = DB::selectOne(
            "SELECT 1 FROM information_schema.statistics
             WHERE table_schema = ? AND table_name = ? AND index_name = ? LIMIT 1",
            [DB::getDatabaseName(), $table, $indexName]
        );

        return (bool) $result;
    }

    public function up(): void
    {
        // created_at
        if (!$this->indexExists('users', 'users_created_at_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index('created_at', 'users_created_at_index');
            });
        }

        // birthday
        if (!$this->indexExists('users', 'users_birthday_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index('birthday', 'users_birthday_index');
            });
        }

        // sex
        if (!$this->indexExists('users', 'users_sex_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index('sex', 'users_sex_index');
            });
        }
    }

    public function down(): void
    {
        if ($this->indexExists('users', 'users_created_at_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_created_at_index');
            });
        }

        if ($this->indexExists('users', 'users_birthday_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_birthday_index');
            });
        }

        if ($this->indexExists('users', 'users_sex_index')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_sex_index');
            });
        }
    }
};
