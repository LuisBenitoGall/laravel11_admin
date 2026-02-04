<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Spec: openspec/specs/core/models/user_cost_center.md
     */
    public function up(): void
    {
        Schema::create('user_cost_centers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('cost_center_id')
                ->constrained('cost_centers')
                ->cascadeOnDelete();

            $table->boolean('is_default')->default(false);

            $table->timestamps();

            $table->unique(['company_id', 'user_id', 'cost_center_id'], 'user_cost_centers_company_user_cost_center_unique');
            $table->index(['company_id', 'user_id'], 'user_cost_centers_company_user_index');
            $table->index(['company_id', 'cost_center_id'], 'user_cost_centers_company_cost_center_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_cost_centers');
    }
};
