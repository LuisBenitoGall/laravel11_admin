<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_variants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('variant', 32); // thumb_sm, thumb_md, preview
            $table->string('disk', 32)->default('local');
            $table->string('path', 512);
            $table->string('mime_type', 128)->nullable();
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();

            $table->timestamps();

            $table->index(['company_id', 'document_id']);
            $table->index(['company_id', 'variant']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_variants');
    }
};
