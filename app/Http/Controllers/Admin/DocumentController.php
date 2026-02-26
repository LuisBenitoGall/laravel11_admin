<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentImageToolsRequest;
use App\Http\Requests\DocumentUpdateRequest;
use App\Http\Requests\DocumentUploadRequest;
use App\Jobs\ProcessDocumentVariants;
use App\Models\Document;
use App\Models\DocumentVariant;
use App\Services\DocumentService;
use App\Support\CompanyContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    private $module = 'company-accounts';
    private $option = 'documentos';

    public function __construct(
        protected DocumentService $documentService
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', Document::class);

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if ($currentCompanyId <= 0) {
            if ($request->header('X-Inertia')) {
                return Inertia::location(route('companies.refresh-session'));
            }
            return redirect()->route('companies.refresh-session')->with('alert', __('empresa_no_activa'));
        }

        $query = Document::query()
            ->forCompany($currentCompanyId)
            ->with(['documentVariants' => fn ($q) => $q->where('variant', DocumentVariant::THUMB_SM)]);

        // Filter by type
        $type = $request->string('type')->toString();
        if ($type === 'image') {
            $query->where('is_image', true);
        } elseif ($type === 'pdf') {
            $query->where('mime_type', 'application/pdf');
        } elseif ($type === 'office') {
            $query->whereIn('mime_type', [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]);
        }

        // Search
        $search = $request->string('search')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('original_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sort = $request->string('sort', 'created_at')->toString();
        $dir = $request->string('dir', 'desc')->toString();
        if (in_array($sort, ['created_at', 'original_name', 'title', 'mime_type', 'size_bytes'], true)) {
            $query->orderBy($sort, $dir === 'asc' ? 'asc' : 'desc');
        }

        $documents = $query->paginate($request->integer('per_page', 24))
            ->withQueryString()
            ->through(function (Document $doc) {
                $thumbUrl = null;
                if ($doc->is_image) {
                    $thumb = $doc->documentVariants->firstWhere('variant', DocumentVariant::THUMB_SM);
                    $base = $thumb
                        ? route('documents.thumb', ['document' => $doc->uuid])
                        : route('documents.preview', ['document' => $doc->uuid]);
                    $thumbUrl = $base . '?v=' . ($doc->updated_at?->timestamp ?? time());
                }

                return [
                    'id'           => $doc->id,
                    'uuid'         => $doc->uuid,
                    'original_name' => $doc->original_name,
                    'title'        => $doc->title,
                    'alt_text'     => $doc->alt_text,
                    'description'  => $doc->description,
                    'mime_type'    => $doc->mime_type,
                    'extension'    => $doc->extension,
                    'size_bytes'   => $doc->size_bytes,
                    'is_image'     => $doc->is_image,
                    'created_at'   => $doc->created_at?->toIso8601String(),
                    'thumb_url'    => $thumbUrl,
                ];
            });

        return Inertia::render('Admin/DocumentGallery/Index', [
            'title'     => __($this->option),
            'subtitle'  => '',
            'module'    => $this->module,
            'slug'      => 'documents',
            'documents' => $documents,
            'filters'   => [
                'type'   => $type,
                'search' => $search,
                'sort'   => $sort,
                'dir'    => $dir,
            ],
        ]);
    }

    public function store(DocumentUploadRequest $request): JsonResponse
    {
        $this->authorize('create', Document::class);

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if ($currentCompanyId <= 0) {
            return response()->json(['message' => __('empresa_no_activa')], 422);
        }

        $files = $request->file('files', []);
        $created = [];

        foreach ($files as $file) {
            $ext = strtolower($file->getClientOriginalExtension());
            $uuid = (string) \Illuminate\Support\Str::uuid();
            $path = $this->documentService->resolveOriginalPath($currentCompanyId, $uuid, $ext);

            $this->documentService->storeOriginal($file, $path);

            $disk = config('document_gallery.disk', 'local');
            $size = $file->getSize();
            $mime = $file->getMimeType();
            $isImage = $this->documentService->isImage($file);

            $width = null;
            $height = null;
            if ($isImage && $sizeInfo = @getimagesize($file->getPathname())) {
                $width = $sizeInfo[0] ?? null;
                $height = $sizeInfo[1] ?? null;
            }

            $document = Document::create([
                'company_id'          => $currentCompanyId,
                'uploaded_by_user_id' => $request->user()?->id,
                'uuid'                => $uuid,
                'disk'                => $disk,
                'path'                => $path,
                'original_name'       => $this->documentService->sanitizeOriginalName($file->getClientOriginalName()),
                'stored_name'         => basename($path),
                'extension'           => $ext,
                'mime_type'           => $mime,
                'size_bytes'          => $size,
                'is_image'            => $isImage,
                'width'               => $width,
                'height'              => $height,
            ]);

            if ($isImage) {
                ProcessDocumentVariants::dispatch($document->id);
            }

            $created[] = [
                'id'           => $document->id,
                'uuid'         => $document->uuid,
                'original_name' => $document->original_name,
                'mime_type'    => $document->mime_type,
                'is_image'     => $document->is_image,
            ];
        }

        return response()->json(['created' => $created], 201);
    }

    public function show(Document $document): JsonResponse
    {
        $this->authorize('view', $document);

        return response()->json([
            'id'           => $document->id,
            'uuid'         => $document->uuid,
            'original_name' => $document->original_name,
            'title'        => $document->title,
            'alt_text'     => $document->alt_text,
            'description'  => $document->description,
            'mime_type'    => $document->mime_type,
            'extension'    => $document->extension,
            'size_bytes'   => $document->size_bytes,
            'is_image'     => $document->is_image,
            'created_at'   => $document->created_at?->toIso8601String(),
            'preview_url'  => route('documents.preview', ['document' => $document->uuid]),
            'download_url' => route('documents.download', ['document' => $document->uuid]),
        ]);
    }

    public function update(DocumentUpdateRequest $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document);

        $document->update($request->only(['title', 'alt_text', 'description']));

        return response()->json([
            'message' => __('guardado_correctamente'),
            'document' => [
                'id'          => $document->id,
                'uuid'        => $document->uuid,
                'title'       => $document->title,
                'alt_text'    => $document->alt_text,
                'description' => $document->description,
            ],
        ]);
    }

    public function destroy(Document $document): JsonResponse
    {
        $this->authorize('delete', $document);

        $document->delete();

        return response()->json(['message' => __('eliminado_correctamente')]);
    }

    public function download(Document $document): StreamedResponse
    {
        $this->authorize('view', $document);

        $disk = $document->disk ?? config('document_gallery.disk', 'local');
        $path = $document->path;

        if (! Storage::disk($disk)->exists($path)) {
            abort(404, __('archivo_no_encontrado'));
        }

        $filename = $document->title
            ? $document->title . '.' . $document->extension
            : $document->original_name;

        return Storage::disk($disk)->download($path, $filename, [
            'Content-Type' => $document->mime_type,
        ]);
    }

    public function preview(Document $document): StreamedResponse|RedirectResponse
    {
        $this->authorize('view', $document);

        $mime = $document->mime_type ?? 'application/octet-stream';

        // Images and PDF: serve inline
        if ($document->is_image || $mime === 'application/pdf') {
            return $this->serveFileInline($document);
        }

        // Office: redirect to download
        return redirect()->route('documents.download', ['document' => $document->uuid]);
    }

    public function thumb(Document $document): StreamedResponse
    {
        $this->authorize('view', $document);

        $thumb = $document->documentVariants()->where('variant', DocumentVariant::THUMB_SM)->first();

        if ($thumb && Storage::disk($thumb->disk)->exists($thumb->path)) {
            return Storage::disk($thumb->disk)->response(
                $thumb->path,
                $document->original_name,
                ['Content-Type' => $thumb->mime_type ?? $document->mime_type],
                'inline'
            );
        }

        // Fallback to original for images
        if ($document->is_image) {
            $disk = $document->disk ?? config('document_gallery.disk', 'local');
            if (Storage::disk($disk)->exists($document->path)) {
                return $this->serveFileInline($document);
            }
        }

        abort(404, __('archivo_no_encontrado'));
    }

    public function imageTools(DocumentImageToolsRequest $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document);

        if (! $document->is_image) {
            return response()->json(['message' => __('Solo se pueden editar imágenes')], 422);
        }

        $disk = $document->disk ?? config('document_gallery.disk', 'local');
        $path = $document->path;

        if (! Storage::disk($disk)->exists($path)) {
            return response()->json(['message' => __('archivo_no_encontrado')], 404);
        }

        $fullPath = Storage::disk($disk)->path($path);
        $extension = strtolower($document->extension ?? 'jpg');

        $source = $this->loadImageForEdit($fullPath, $extension);
        if (! $source) {
            return response()->json(['message' => __('No se pudo cargar la imagen')], 422);
        }

        $w = imagesx($source);
        $h = imagesy($source);

        $crop = $request->input('crop');
        if ($crop) {
            $unit = $crop['unit'] ?? 'percent';
            if ($unit === 'percent') {
                // Crop sent in 0-100 percent; apply to actual image dimensions
                $x = (int) round((float) $crop['x'] / 100 * $w);
                $y = (int) round((float) $crop['y'] / 100 * $h);
                $cropW = (int) round((float) $crop['width'] / 100 * $w);
                $cropH = (int) round((float) $crop['height'] / 100 * $h);
            } else {
                $x = (int) $crop['x'];
                $y = (int) $crop['y'];
                $cropW = (int) $crop['width'];
                $cropH = (int) $crop['height'];
            }
            $x = max(0, min($x, $w - 1));
            $y = max(0, min($y, $h - 1));
            $cropW = min($cropW, $w - $x);
            $cropH = min($cropH, $h - $y);
            if ($cropW < 1 || $cropH < 1) {
                imagedestroy($source);
                return response()->json(['message' => __('Recorte no válido')], 422);
            }
            $cropped = imagecrop($source, ['x' => $x, 'y' => $y, 'width' => $cropW, 'height' => $cropH]);
            imagedestroy($source);
            if (! $cropped) {
                return response()->json(['message' => __('Error al recortar')], 422);
            }
            $source = $cropped;
            $w = imagesx($source);
            $h = imagesy($source);
        }

        $resize = $request->input('resize');
        if ($resize && ($w > 0 && $h > 0)) {
            $newW = (int) $resize['max_width'];
            $newH = (int) $resize['max_height'];
            $newW = max(1, min(4096, $newW));
            $newH = max(1, min(4096, $newH));
            $dest = imagecreatetruecolor($newW, $newH);
            if ($dest) {
                if ($extension === 'png') {
                    imagealphablending($dest, false);
                    imagesavealpha($dest, true);
                }
                imagecopyresampled($dest, $source, 0, 0, 0, 0, $newW, $newH, $w, $h);
                imagedestroy($source);
                $source = $dest;
            }
        }

        $saved = $this->saveImageFromResource($source, $fullPath, $extension);
        if (is_resource($source) || $source instanceof \GdImage) {
            imagedestroy($source);
        }
        if (! $saved) {
            return response()->json(['message' => __('Error al guardar la imagen')], 500);
        }

        $document->documentVariants()->delete();
        ProcessDocumentVariants::dispatchSync($document->id);
        $document->touch();

        return response()->json([
            'message' => __('guardado_correctamente'),
            'document' => ['uuid' => $document->uuid],
        ]);
    }

    protected function loadImageForEdit(string $path, string $extension)
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

    protected function saveImageFromResource($resource, string $path, string $extension): bool
    {
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                return imagejpeg($resource, $path, 90);
            case 'png':
                return imagepng($resource, $path, 8);
            case 'gif':
                return imagegif($resource, $path);
            case 'webp':
                return imagewebp($resource, $path, 90);
            default:
                return false;
        }
    }

    protected function serveFileInline(Document $document): StreamedResponse
    {
        $disk = $document->disk ?? config('document_gallery.disk', 'local');
        $path = $document->path;

        if (! Storage::disk($disk)->exists($path)) {
            abort(404, __('archivo_no_encontrado'));
        }

        return Storage::disk($disk)->response(
            $path,
            $document->original_name,
            ['Content-Type' => $document->mime_type],
            'inline'
        );
    }
}
