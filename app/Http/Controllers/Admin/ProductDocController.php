<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Models:
use App\Models\Product;
use App\Models\ProductDoc;

class ProductDocController extends Controller
{
    /**
     * 1. Imágenes por producto.
     */
    


    /**
     * 1. Imágenes por producto.
     */
    public function show(Request $request, Product $product){
        // ✅ Autorización (si tienes ProductPolicy, esto es lo correcto)
        // Si todavía no tienes policy para Product, al menos deja el check de empresa.
        $this->authorize('view', $product);

        // ✅ Multiempresa (cinturón y tirantes)
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if ((int) $product->company_id !== $currentCompanyId) {
            abort(404);
        }

        // Tipos que consideras "imagen" (configurable)
        // Puedes moverlo a config/products.php => 'image_doc_types' => ['image']
        $imageTypes = config('products.image_doc_types', ['image']);

        // Query base (solo imágenes, solo no borradas por SoftDeletes)
        $baseQuery = ProductDoc::query()
            ->forProduct($product->id)
            ->images($imageTypes)
            ->ordered();

        // Última modificación (para cache + HTTP cache)
        $lastUpdated = $baseQuery->clone()->max('updated_at') ?? $product->updated_at;

        $lastUpdatedTs = $lastUpdated ? (string) $lastUpdated->timestamp : '0';
        $etag = sha1("product_images|{$currentCompanyId}|{$product->id}|{$lastUpdatedTs}");

        // HTTP cache: si el cliente ya lo tiene, 304 y a otra cosa
        $response = response()->json();
        $response->setEtag($etag);
        if ($lastUpdated) {
            $response->setLastModified($lastUpdated);
        }
        if ($response->isNotModified($request)) {
            return $response; // 304
        }

        // Cache de aplicación (5 min) con key dependiente de updated_at => invalida solo
        $cacheKey = "product_images:{$currentCompanyId}:{$product->id}:{$etag}";

        $payload = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($baseQuery) {
            $docs = $baseQuery->get(['id', 'doc', 'type', 'featured', 'created_at', 'updated_at']);

            $images = $docs->map(function ($doc) {
                $path = (string) $doc->doc;

                // Si ya guardas URL absoluta en doc, respétala
                $url = Str::startsWith($path, ['http://', 'https://', '//'])
                    ? $path
                    : Storage::url($path); // asume default disk y rutas tipo "product_docs/xxx.jpg"

                // Caption simple: si featured, lo marcamos. Si no, vacío (puedes personalizar)
                $caption = $doc->featured ? __('principal') : null;

                // Alt razonable: usa el filename
                $alt = basename(parse_url($url, PHP_URL_PATH) ?: $url);

                return [
                    'id'       => $doc->id,
                    'url'      => $url,
                    'caption'  => $caption,
                    'alt'      => $alt,
                    'featured' => (bool) $doc->featured,
                    'type'     => $doc->type,
                ];
            })
            // Evita slides rotas
            ->filter(fn ($img) => !empty($img['url']))
            ->values();

            return [
                'images' => $images,
                'meta' => [
                    'count' => $images->count(),
                    'updated_at' => optional($docs->max('updated_at'))->toISOString(),
                ],
            ];
        });

        return response()
        ->json($payload)
        ->setEtag($etag)
        ->setLastModified($lastUpdated);    
    }
}
