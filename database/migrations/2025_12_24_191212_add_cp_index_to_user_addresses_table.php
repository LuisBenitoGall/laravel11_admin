<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    private function indexExists(string $table, string $indexName): bool
    {
        $dbName = DB::getDatabaseName();

        $result = DB::selectOne(
            "SELECT 1
             FROM information_schema.statistics
             WHERE table_schema = ?
               AND table_name = ?
               AND index_name = ?
             LIMIT 1",
            [$dbName, $table, $indexName]
        );

        return (bool) $result;
    }

    public function up(): void
    {
        Schema::table('user_addresses', function (Blueprint $table) {
            // nada aquí: usamos condición con información_schema abajo
        });

        if (!$this->indexExists('user_addresses', 'user_addresses_cp_index')) {
            Schema::table('user_addresses', function (Blueprint $table) {
                $table->index('cp', 'user_addresses_cp_index');
            });
        }
    }

    public function down(): void
    {
        if ($this->indexExists('user_addresses', 'user_addresses_cp_index')) {
            Schema::table('user_addresses', function (Blueprint $table) {
                $table->dropIndex('user_addresses_cp_index');
            });
        }
    }
};
