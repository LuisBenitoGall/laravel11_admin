<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_providers', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_id')->nullable()->change();
            $table->unsignedBigInteger('user_customer_id')->nullable()->after('customer_id');
            $table->foreign('user_customer_id')
                ->references('id')
                ->on('users')
                ->restrictOnDelete();
            $table->unique(
                ['user_customer_id', 'provider_id', 'deleted_at'],
                'cp_user_customer_provider_deleted_unique'
            );
            $table->index('user_customer_id');
        });

        try {
            DB::statement('ALTER TABLE customer_providers DROP CONSTRAINT chk_customer_provider_diff');
        } catch (\Throwable $e) {
            // MySQL / SQLite naming variants
            try {
                DB::statement('ALTER TABLE customer_providers DROP CHECK chk_customer_provider_diff');
            } catch (\Throwable $e2) {
            }
        }

        try {
            DB::statement('ALTER TABLE customer_providers
                ADD CONSTRAINT chk_customer_provider_xor
                CHECK ((customer_id IS NULL) <> (user_customer_id IS NULL))');
        } catch (\Throwable $e) {
        }

        try {
            DB::statement('ALTER TABLE customer_providers
                ADD CONSTRAINT chk_customer_provider_diff
                CHECK (customer_id IS NULL OR customer_id <> provider_id)');
        } catch (\Throwable $e) {
        }
    }

    public function down(): void
    {
        try {
            DB::statement('ALTER TABLE customer_providers DROP CONSTRAINT chk_customer_provider_xor');
        } catch (\Throwable $e) {
            try {
                DB::statement('ALTER TABLE customer_providers DROP CHECK chk_customer_provider_xor');
            } catch (\Throwable $e2) {
            }
        }

        try {
            DB::statement('ALTER TABLE customer_providers DROP CONSTRAINT chk_customer_provider_diff');
        } catch (\Throwable $e) {
            try {
                DB::statement('ALTER TABLE customer_providers DROP CHECK chk_customer_provider_diff');
            } catch (\Throwable $e2) {
            }
        }

        Schema::table('customer_providers', function (Blueprint $table) {
            $table->dropUnique('cp_user_customer_provider_deleted_unique');
            $table->dropForeign(['user_customer_id']);
            $table->dropIndex(['user_customer_id']);
            $table->dropColumn('user_customer_id');
            $table->unsignedBigInteger('customer_id')->nullable(false)->change();
        });

        try {
            DB::statement('ALTER TABLE customer_providers
                ADD CONSTRAINT chk_customer_provider_diff
                CHECK (customer_id <> provider_id)');
        } catch (\Throwable $e) {
        }
    }
};
