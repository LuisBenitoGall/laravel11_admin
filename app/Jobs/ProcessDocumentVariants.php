<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\DocumentVariant;
use App\Services\DocumentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessDocumentVariants implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public int $documentId
    ) {}

    public function handle(DocumentService $documentService): void
    {
        $document = Document::find($this->documentId);
        if (! $document || ! $document->is_image) {
            return;
        }

        $disk = $document->disk ?? config('document_gallery.disk', 'local');
        $path = $document->path;

        if (! Storage::disk($disk)->exists($path)) {
            Log::warning("ProcessDocumentVariants: original file missing for document {$document->id}");
            return;
        }

        $fullPath = Storage::disk($disk)->path($path);
        $extension = strtolower($document->extension ?? 'jpg');

        try {
            $source = $this->loadImage($fullPath, $extension);
            if (! $source) {
                Log::warning("ProcessDocumentVariants: could not load image for document {$document->id}");
                return;
            }

            $source = $this->normalizeExifOrientation($source, $fullPath, $extension);
            $companyId = (int) $document->company_id;
            $uuid = $document->uuid;
            $variants = config('document_gallery.image_variants', []);

            foreach ($variants as $variantName => $config) {
                $maxW = (int) ($config['width'] ?? 0);
                $maxH = (int) ($config['height'] ?? 0);
                if ($maxW <= 0 || $maxH <= 0) {
                    continue;
                }

                $outPath = $documentService->resolveVariantPath($companyId, $uuid, $variantName, $extension);
                $saved = $this->resizeAndStore($source, $disk, $outPath, $maxW, $maxH, $extension);
                if ($saved) {
                    $this->createVariantRecord($document, $variantName, $disk, $outPath, $extension);
                }
            }

            if (is_resource($source) || $source instanceof \GdImage) {
                imagedestroy($source);
            }
        } catch (\Throwable $e) {
            Log::error("ProcessDocumentVariants failed for document {$document->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * @param string $path
     * @param string $extension
     * @return \GdImage|resource|false
     */
    protected function loadImage(string $path, string $extension)
    {
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                return @imagecreatefromjpeg($path);
            case 'png':
                return @imagecreatefrompng($path);
            case 'gif':
                return @imagecreatefromgif($path);
            case 'webp':
                return @imagecreatefromwebp($path);
            default:
                return false;
        }
    }

    /**
     * Apply EXIF orientation so the image displays correctly.
     *
     * @param \GdImage|resource $image
     * @param string $path
     * @param string $extension
     * @return \GdImage|resource
     */
    protected function normalizeExifOrientation($image, string $path, string $extension)
    {
        if (! in_array($extension, ['jpg', 'jpeg'], true)) {
            return $image;
        }
        if (! function_exists('exif_read_data')) {
            return $image;
        }
        $exif = @exif_read_data($path);
        $orientation = (int) ($exif['Orientation'] ?? 1);
        if ($orientation <= 1) {
            return $image;
        }

        $rotated = null;
        switch ($orientation) {
            case 2:
                imageflip($image, IMG_FLIP_HORIZONTAL);
                return $image;
            case 3:
                $rotated = imagerotate($image, 180, 0);
                break;
            case 4:
                imageflip($image, IMG_FLIP_VERTICAL);
                return $image;
            case 5:
                $rotated = imagerotate($image, -90, 0);
                if ($rotated) {
                    imageflip($rotated, IMG_FLIP_HORIZONTAL);
                }
                break;
            case 6:
                $rotated = imagerotate($image, -90, 0);
                break;
            case 7:
                $rotated = imagerotate($image, 90, 0);
                if ($rotated) {
                    imageflip($rotated, IMG_FLIP_HORIZONTAL);
                }
                break;
            case 8:
                $rotated = imagerotate($image, 90, 0);
                break;
            default:
                return $image;
        }

        if ($rotated) {
            imagedestroy($image);
            return $rotated;
        }

        return $image;
    }

    protected function resizeAndStore($source, string $disk, string $outPath, int $maxW, int $maxH, string $extension): bool
    {
        $w = imagesx($source);
        $h = imagesy($source);
        if ($w <= 0 || $h <= 0) {
            return false;
        }

        $scale = min($maxW / $w, $maxH / $h, 1.0);
        $newW = (int) round($w * $scale);
        $newH = (int) round($h * $scale);
        if ($newW < 1) {
            $newW = 1;
        }
        if ($newH < 1) {
            $newH = 1;
        }

        $dest = imagecreatetruecolor($newW, $newH);
        if (! $dest) {
            return false;
        }

        if ($extension === 'png') {
            imagealphablending($dest, false);
            imagesavealpha($dest, true);
            $transparent = imagecolorallocatealpha($dest, 255, 255, 255, 127);
            imagefill($dest, 0, 0, $transparent);
        }

        imagecopyresampled($dest, $source, 0, 0, 0, 0, $newW, $newH, $w, $h);

        $dir = dirname($outPath);
        if (! Storage::disk($disk)->exists($dir)) {
            Storage::disk($disk)->makeDirectory($dir);
        }

        $fullOut = Storage::disk($disk)->path($outPath);
        $dirReal = dirname($fullOut);
        if (! is_dir($dirReal)) {
            mkdir($dirReal, 0755, true);
        }

        $ok = false;
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $ok = imagejpeg($dest, $fullOut, 88);
                break;
            case 'png':
                $ok = imagepng($dest, $fullOut, 8);
                break;
            case 'gif':
                $ok = imagegif($dest, $fullOut);
                break;
            case 'webp':
                $ok = imagewebp($dest, $fullOut, 88);
                break;
        }

        imagedestroy($dest);
        return $ok;
    }

    protected function createVariantRecord(Document $document, string $variantName, string $disk, string $path, string $extension): void
    {
        $mime = match ($extension) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };

        $size = Storage::disk($disk)->exists($path) ? Storage::disk($disk)->size($path) : 0;
        $width = null;
        $height = null;
        $fullPath = Storage::disk($disk)->path($path);
        if (file_exists($fullPath)) {
            $info = @getimagesize($fullPath);
            if ($info) {
                $width = $info[0] ?? null;
                $height = $info[1] ?? null;
            }
        }

        DocumentVariant::updateOrCreate(
            [
                'document_id' => $document->id,
                'variant' => $variantName,
            ],
            [
                'company_id' => $document->company_id,
                'disk' => $disk,
                'path' => $path,
                'mime_type' => $mime,
                'size_bytes' => $size,
                'width' => $width,
                'height' => $height,
            ]
        );
    }
}
