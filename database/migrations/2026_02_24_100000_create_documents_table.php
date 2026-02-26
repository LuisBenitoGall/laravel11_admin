<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('disk', 32)->default('local');
            $table->string('path', 512);
            $table->string('original_name', 512);
            $table->string('stored_name', 512);
            $table->string('extension', 32);
            $table->string('mime_type', 128);
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->boolean('is_image')->default(false);
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('title', 512)->nullable();
            $table->string('alt_text', 512)->nullable();
            $table->text('description')->nullable();
            $table->json('meta')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'created_at']);
            $table->index(['company_id', 'mime_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
