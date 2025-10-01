<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('user_images', function (Blueprint $table) {
            $table->id();

            $table->string('image', 191);               // ruta/filename en storage
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->boolean('featured')->default(false);
            $table->boolean('public')->default(false);

            $table->softDeletes();
            $table->timestamps();

            // Evitar duplicados tontos por usuario y archivo (permitiendo rehacer tras soft delete)
            $table->unique(['user_id','image','deleted_at'], 'user_images_user_image_deleted_unique');

            // Índices para listados
            $table->index('user_id', 'user_images_user_id_index');
            $table->index('public',  'user_images_public_index');
            $table->index('deleted_at', 'user_images_deleted_at_index');
        });

        // Enforce: solo UN featured=1 por usuario con índice único parcial vía columna generada
        try {
            DB::statement("
                ALTER TABLE user_images
                ADD COLUMN featured_user_id BIGINT UNSIGNED
                GENERATED ALWAYS AS (CASE WHEN featured = 1 THEN user_id ELSE NULL END) STORED
            ");
            DB::statement("
                ALTER TABLE user_images
                ADD UNIQUE KEY user_images_one_featured_per_user (featured_user_id)
            ");
        } catch (\Throwable $e) {
            // Si tu motor no soporta columnas generadas, avísame y lo movemos a lógica de dominio.
        }
    }

    public function down(): void{
        // Limpieza de índices/columna generada si existen
        try { DB::statement("ALTER TABLE user_images DROP INDEX user_images_one_featured_per_user"); } catch (\Throwable $e) {}
        try { DB::statement("ALTER TABLE user_images DROP COLUMN featured_user_id"); } catch (\Throwable $e) {}

        Schema::dropIfExists('user_images');
    }
};
