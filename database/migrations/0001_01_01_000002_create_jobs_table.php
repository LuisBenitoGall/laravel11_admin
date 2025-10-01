<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue', 191)->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');

            // Índices que ayudan al pop del worker (database driver)
            $table->index(['queue', 'reserved_at'], 'jobs_queue_reserved_at_index');
            $table->index(['queue', 'available_at'], 'jobs_queue_available_at_index');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id', 191)->primary();
            $table->string('name', 191);
            $table->unsignedInteger('total_jobs');
            $table->unsignedInteger('pending_jobs');
            $table->unsignedInteger('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->unsignedInteger('cancelled_at')->nullable()->index('job_batches_cancelled_at_index');
            $table->unsignedInteger('created_at');
            $table->unsignedInteger('finished_at')->nullable()->index('job_batches_finished_at_index');
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
            $table->index('failed_at', 'failed_jobs_failed_at_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
    }
};
