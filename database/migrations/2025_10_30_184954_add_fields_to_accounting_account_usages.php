<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::table('accounting_account_usages', function (Blueprint $table) {
            // Nuevos campos
            if (!Schema::hasColumn('accounting_account_usages', 'iva_type_id')) {
                $table->unsignedBigInteger('iva_type_id')->nullable()->after('company_id');
                // FK opcional:
                // $table->foreign('iva_type_id')->references('id')->on('iva_types')->nullOnDelete();
            }

            if (!Schema::hasColumn('accounting_account_usages', 'side')) {
                $table->enum('side', ['output', 'input'])->nullable()->after('iva_type_id');
            }

            if (!Schema::hasColumn('accounting_account_usages', 'locked')) {
                $table->boolean('locked')->default(false)->after('account_id');
            }

            if (!Schema::hasColumn('accounting_account_usages', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('notes');
            }

            if (!Schema::hasColumn('accounting_account_usages', 'updated_by')) {
                $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            }
        });

        // Índice único si no existe
        if (!$this->indexExists('accounting_account_usages', 'acc_usage_company_iva_side_unique')) {
            Schema::table('accounting_account_usages', function (Blueprint $table) {
                $table->unique(['company_id', 'iva_type_id', 'side'], 'acc_usage_company_iva_side_unique');
            });
        }    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        // Quitar índice único si existe
        if ($this->indexExists('accounting_account_usages', 'acc_usage_company_iva_side_unique')) {
            Schema::table('accounting_account_usages', function (Blueprint $table) {
                $table->dropUnique('acc_usage_company_iva_side_unique');
            });
        }

        Schema::table('accounting_account_usages', function (Blueprint $table) {
            if (Schema::hasColumn('accounting_account_usages', 'updated_by')) {
                $table->dropColumn('updated_by');
            }
            if (Schema::hasColumn('accounting_account_usages', 'created_by')) {
                $table->dropColumn('created_by');
            }
            if (Schema::hasColumn('accounting_account_usages', 'locked')) {
                $table->dropColumn('locked');
            }
            if (Schema::hasColumn('accounting_account_usages', 'side')) {
                $table->dropColumn('side');
            }
            if (Schema::hasColumn('accounting_account_usages', 'iva_type_id')) {
                // Si declaraste FK, bórrala antes:
                // $table->dropForeign(['iva_type_id']);
                $table->dropColumn('iva_type_id');
            }
        });
    }

    private function indexExists(string $table, string $indexName): bool{
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            $rows = DB::select('SHOW INDEX FROM `' . $table . '` WHERE Key_name = ?', [$indexName]);
            return !empty($rows);
        }

        if ($driver === 'pgsql') {
            $rows = DB::select(
                "SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $indexName]
            );
            return !empty($rows);
        }

        if ($driver === 'sqlite') {
            $rows = DB::select('PRAGMA index_list(' . $table . ')');
            foreach ($rows as $row) {
                // name o seq depende de la versión; cubrimos ambos
                $name = $row->name ?? ($row->Name ?? null);
                if ($name === $indexName) {
                    return true;
                }
            }
            return false;
        }

        // Para motores raros: que sea lo que el DBA quiera
        return false;
    }
};
