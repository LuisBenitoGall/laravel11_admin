<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drops the foreign key constraint from crm_accounts.linked_company_id
     * but leaves the column in place so historical links remain available.
     */
    public function up(): void
    {
        // information_schema is MySQL-only; skip on SQLite (FK/index already absent)
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Use information_schema to drop only existing constraints/indexes safely
        $database = DB::getDatabaseName();

        // Find foreign key constraints on linked_company_id
        $fks = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$database, 'crm_accounts', 'linked_company_id']
        );

        foreach ($fks as $fk) {
            try {
                DB::statement(sprintf('ALTER TABLE `crm_accounts` DROP FOREIGN KEY `%s`', $fk->CONSTRAINT_NAME));
            } catch (\Throwable $e) {
                // ignore errors dropping FK
            }
        }

        // Find indexes on linked_company_id (MySQL may create index for FK or explicit indexes)
        $indexes = DB::select(
            'SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$database, 'crm_accounts', 'linked_company_id']
        );

        foreach ($indexes as $idx) {
            // Skip primary
            if ($idx->INDEX_NAME === 'PRIMARY') continue;
            try {
                DB::statement(sprintf('DROP INDEX `%s` ON `crm_accounts`', $idx->INDEX_NAME));
            } catch (\Throwable $e) {
                // ignore
            }
        }
    }

    /**
     * Reverse the migrations.
     * Recreate the foreign key constraint to companies.id (nullable, set null on delete).
     */
    public function down(): void
    {
        Schema::table('crm_accounts', function (Blueprint $table) {
            // Ensure the column is nullable so the FK can be restored with nullOnDelete
            $table->unsignedBigInteger('linked_company_id')->nullable()->change();

            // Recreate the foreign key
            $table->foreign('linked_company_id')
                ->references('id')
                ->on('companies')
                ->nullOnDelete();
        });
    }
};
