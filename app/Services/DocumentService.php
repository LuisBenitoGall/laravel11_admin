<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    public function resolveOriginalPath(int $companyId, string $uuid, string $extension): string
    {
        return "companies/{$companyId}/documents/originals/{$uuid}.{$extension}";
    }

    public function resolveVariantPath(int $companyId, string $documentUuid, string $variant, string $extension): string
    {
        return "companies/{$companyId}/documents/variants/{$documentUuid}/{$variant}.{$extension}";
    }

    /**
     * Sanitize original filename to prevent path traversal.
     */
    public function sanitizeOriginalName(string $name): string
    {
        $name = basename($name);
        $name = str_replace(['..', '/', '\\'], '', $name);
        $name = preg_replace('/[^\p{L}\p{N}\s\-_.]/u', '_', $name) ?? $name;
        $name = trim($name);
        return $name ?: 'file';
    }

    /**
     * Validate MIME type against allowed config and real file content.
     */
    public function validateMimeAndExtension(UploadedFile $file): void
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $allowedExt = config('document_gallery.allowed_extensions', []);
        if (! in_array($ext, $allowedExt, true)) {
            throw new \InvalidArgumentException("Extensión no permitida: {$ext}");
        }

        $allowedMimes = config('document_gallery.allowed_mime_types', []);
        $mimesForExt = $allowedMimes[$ext] ?? [];
        if (empty($mimesForExt)) {
            throw new \InvalidArgumentException("No hay tipos MIME configurados para {$ext}");
        }

        $realMime = $file->getMimeType();
        if (! in_array($realMime, $mimesForExt, true)) {
            throw new \InvalidArgumentException("Tipo MIME no permitido: {$realMime}");
        }
    }

    public function isImage(UploadedFile $file): bool
    {
        return str_starts_with($file->getMimeType(), 'image/');
    }

    public function storeOriginal(UploadedFile $file, string $path): string
    {
        $disk = config('document_gallery.disk', 'local');
        return $file->storeAs(dirname($path), basename($path), $disk);
    }

    public function deleteFile(string $path): bool
    {
        $disk = config('document_gallery.disk', 'local');
        return Storage::disk($disk)->delete($path);
    }
}
