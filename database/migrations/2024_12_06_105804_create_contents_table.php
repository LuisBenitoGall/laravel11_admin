<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void{
        Schema::create('contents', function (Blueprint $table){
            $table->id();

            $table->string('name')->nullable();                   // nombre interno
            $table->string('code')->unique();                     // único y no reutilizable
            $table->string('referrer')->nullable();               // identificador libre
            $table->unsignedTinyInteger('type');                  // 1=info, 2=contenido (ampliable)
            $table->json('title')->nullable();                    // i18n JSON
            $table->string('slug')->unique();                     // único
            $table->json('excerpt')->nullable();                  // i18n JSON
            $table->json('content')->nullable();                  // i18n JSON
            $table->json('tags')->nullable();                     // i18n JSON            $table->text('links')->nullable();
            $table->longText('video')->nullable();
            $table->text('classes')->nullable();
            $table->boolean('status')->default(true);             // solo true se publica
            $table->text('observations')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->dateTime('published_end')->nullable();

            // Autoría
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->constrained('users')->restrictOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Índices útiles
            $table->index('status', 'contents_status_index');
            $table->index(['status','published_at','published_end'], 'contents_publish_window_index');
            $table->index('type', 'contents_type_index');
            $table->index('deleted_at', 'contents_deleted_at_index');
        });

        // Opcional: CHECKs (si tu motor lo soporta)
        try {
            DB::statement("ALTER TABLE contents ADD CONSTRAINT chk_contents_status CHECK (status IN (0,1))");
            DB::statement("ALTER TABLE contents ADD CONSTRAINT chk_contents_type CHECK (type >= 0 AND type <= 255)");
        } catch (\Throwable $e) {
            // Ignorar si no hay soporte de CHECK o ya existen
        }
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE contents DROP CONSTRAINT chk_contents_status"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE contents DROP CONSTRAINT chk_contents_type"); } catch (\Throwable $e) {}
        Schema::dropIfExists('contents');
    }
};
