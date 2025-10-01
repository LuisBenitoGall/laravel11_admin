<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use File;
use Carbon\Carbon;

//Models:
use App\Models\Content;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\ContentFilterRequest;
use App\Http\Requests\ContentStoreRequest;
use App\Http\Requests\ContentUpdateRequest;

//Resources:
use App\Http\Resources\ContentResource;

//Traits:
use App\Traits\ConvertDateTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class ContentController extends Controller{
    /**
     * 1. Listado de contenidos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo contenido.
     * 3. Contenido popover.
     * 3.1. Recargar contenido a BD.
     * 3.2. Generar .json de contenidos.
     * 4. Guardar nuevo contenido.
     * 5. Editar contenido.
     * 6. Actualizar contenido.
     */
    
    use ConvertDateTrait;
    use HasUserPermissionsTrait;
    use LocaleTrait;
    
    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'contents.create',
                'contents.destroy',
                'contents.edit',
                'contents.index',
                'contents.search',
                'contents.show',
                'contents.update'
            ]);   
        } 
    }   

    //0.1. Validar content code:
    protected function validateCode(array $arrCode, int $ignoreId = null){
        return Validator::make($arrCode, [
            'code' => [
                Rule::unique('contents')
                    ->ignore($ignoreId)
                    ->whereNull('deleted_at')           // en store será null
            ],
        ], [
            'code.unique' => __('contenido_nombre_existe'),
        ]);
    }
    
    /**
     * 1. Listado de contenidos.
     */
    public function index(ContentFilterRequest $request){
        //Recargar contenidos en BD:
        //Utilizar sólo para recargar contenidos desde .json a BD.
        //$this->reloadContents();

        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $contents = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Content/Index', [
            "title" => __($this->option),
            "subtitle" => __('contenidos'),
            "module" => $this->module,
            "slug" => 'contents',
            "contents" => ContentResource::collection($contents),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblContents'] 
            )
        ]);     
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(ContentFilterRequest $request){
        $cacheKey = 'filtered_contents_' . md5(json_encode($request->all()));

        $contents = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'contents' => ContentResource::collection($contents)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(ContentFilterRequest $request){
        $query = Content::query();

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'code' => fn($q, $v) => $q->where('code', 'like', "%$v%")
        ];

        foreach($filters as $key => $callback){
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // Filtros por rangos de fechas dinámicos
        $dateFilters = [
            'created_at' => ['date_from', 'date_to']
        ];

        foreach ($dateFilters as $column => [$fromKey, $toKey]) {
            $from = $request->input($fromKey);
            $to = $request->input($toKey);

            if ($from && $to) {
                $query->whereBetween($column, ["$from 00:00:00", "$to 23:59:59"]);
            } elseif ($from) {
                $query->where($column, '>=', "$from 00:00:00");
            } elseif ($to) {
                $query->where($column, '<=', "$to 23:59:59");
            }
        }

        // Ordenación
        $sortField = $request->input('sort_field', 'status');
        $sortDirection = $request->input('sort_direction', 'DESC');
        $allowedSortFields = ['name', 'code'];

        if(!in_array($sortField, $allowedSortFields)){
            $sortField = 'name';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo contenido.
     */
    public function create(){
        return Inertia::render('Admin/Content/Create', [
            "title" => __($this->option),
            "subtitle" => __('contenido_nuevo'),
            "module" => $this->module,
            "slug" => 'contents',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);     
    }

    /**
     * 3. Contenido popover.
     */
    public function info($code){
        $path = storage_path('json/contents.json');

        if(!file_exists($path)){
            return response()->json(['error' => 'Archivo no encontrado'], 404);
        }

        //$json = json_decode(file_get_contents($path), true);
        $json = cache()->remember('contents_json', 3600, function () use ($path){
            return json_decode(file_get_contents($path), true);
        });

        if(!is_array($json) || count($json) === 0){
            return response()->json(['error' => 'JSON vacío o no es un array'], 500);
        }

        $content = collect($json)->firstWhere('code', $code);

        if (!$content) {
            return response()->json(['error' => 'Código no encontrado: ' . $code], 404);
        }

        logger('Contenido encontrado:', $content); 

        try {
            $title = is_string($content['title']) ? unserialize($content['title']) : [];
            $excerpt = is_string($content['excerpt']) ? unserialize($content['excerpt']) : [];
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Unserialization error', 'details' => $e->getMessage()], 500);
        }

        $locale = session('locale', app()->getLocale());
        $titleText = $title[$locale] ?? collect($title)->filter()->first() ?? '';
        $excerptText = $excerpt[$locale] ?? collect($excerpt)->filter()->first() ?? '';

        return response()->json([
            'title' => $titleText,
            'excerpt' => $excerptText,
        ]);
    }

    /**
     * 3.1. Recargar contenido a BD.
     */
    private function reloadContents(): void {
        $path = storage_path('json/contents.json');   

        if(! file_exists($path)){
            throw new \RuntimeException("El fichero contents.json no existe en {$path}");
        }

        $contents = json_decode(file_get_contents($path), true);
        if(! is_array($contents)){
            throw new \RuntimeException("El JSON no contiene un array válido de contenidos");
        }

        //Reseteamos la tabla de contenidos:
        Schema::disableForeignKeyConstraints();
        DB::table('contents')->truncate(); 
        Schema::enableForeignKeyConstraints();

        DB::transaction(function () use ($contents) {
            foreach ($contents as $item) {
                // Si tu JSON incluye directamente los campos de la tabla:
                Content::create([
                    'name'          => $item['name']          ?? null,
                    'code'          => $item['code']          ?? null,
                    'referrer'      => $item['referrer']      ?? null,
                    'type'          => $item['type']          ?? null,
                    'title'         => $item['title']         ?? null,
                    'slug'          => $item['slug']          ?? null,
                    'excerpt'       => $item['excerpt']       ?? null,
                    'content'       => $item['content']       ?? null,
                    'tags'          => $item['tags']          ?? null,
                    'links'         => $item['links']         ?? null,
                    'video'         => $item['video']         ?? null,
                    'classes'       => $item['classes']       ?? null,
                    'status'        => $item['status']        ?? 1,
                    'observations'  => $item['observations']  ?? null,
                    'published_at'  => $item['published_at']  ?? null,
                    'published_end' => $item['published_end'] ?? null,
                    'created_by'    => $item['user_id']       ?? Auth::user()->id,
                    'updated_by'    => $item['user_id']       ?? Auth::user()->id,
                    'created_at'    => $item['created_at']    ?? now(),
                    'updated_at'    => $item['updated_at']    ?? now(),
                ]);
            }
        });
    }

    /**
     * 3.2. Generar .json de contenidos.
     */
    public function jsonContents(){
        $cont = Content::where('status', 1)->get();
        $jsondata = json_encode(
            $cont->map->toArray(), // ->toArray() para serializar correctamente
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );
        file_put_contents(storage_path('json/contents.json'), $jsondata);

        //Reseteo de caché:
        Cache::forget('contents_json');

        // $images = ContentImage::all();
        // $jsonimages = json_encode($images);
        // file_put_contents(storage_path()."/json/content-images.json", $jsondata);
    }

    /**
     * 4. Guardar nuevo contenido.
     */
    public function store(ContentStoreRequest $request){
        $code = Str::slug($request->name);
        $arrCode = ['code' => $code];
        //Validamos el código:
        $validateCode = $this->validateCode($arrCode);
        if($validateCode->fails()){
            return redirect()->route('contents.create')
                ->withErrors($validateCode)
                ->withInput();
        }  

        $status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN)? 1:0;

        $content = new Content;
        $content->name = $request->input('name');
        $content->slug = Str::slug($request->input('name'));
        $content->code = $code;
        $content->type = $request->input('type');
        $content->created_by = Auth::user()->id;
        $content->updated_by = Auth::user()->id;
        $content->status = $status;
        $content->save();

        //Generar .json de contenidos:
        $this->jsonContents();

        return redirect()->route('contents.edit', $content->id)
            ->with('msg', __('contenido_creado_msg'));
    }

    /**
     * 5. Editar contenido.
     */
    public function edit(Content $content){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));  

        //Deserializamos las columnas serializadas:
        $locales = LocaleTrait::availableLocales();

        $titles = $content->title? unserialize($content->title):[];
        //Aseguramos que haya una entrada para cada locale (vacía si no existe)
        $titles = array_merge(
            array_fill_keys($locales, ''), 
            $titles
        );

        $tags = $content->tags? unserialize($content->tags):[];
        //Aseguramos que haya una entrada para cada locale (vacía si no existe)
        $tags = array_merge(
            array_fill_keys($locales, ''), 
            $tags
        );

        $excerpts = $content->excerpt? unserialize($content->excerpt):[];
        $excerpts = array_merge(
            array_fill_keys($locales, ''), 
            $excerpts
        );

        $contents = $content->content? unserialize($content->content):[];
        //Aseguramos que haya una entrada para cada locale (vacía si no existe)
        $contents = array_merge(
            array_fill_keys($locales, ''), 
            $contents
        );
        
        //Formateo de datos:
        $content->formatted_created_at = Carbon::parse($content->created_at)->format($locale[4].' H:i:s');
        $content->formatted_updated_at = Carbon::parse($content->updated_at)->format($locale[4].' H:i:s');  

        $content->created_by_name = optional($content->createdBy)->full_name ?? false;
        $content->updated_by_name = optional($content->updatedBy)->full_name ?? false;

        return Inertia::render('Admin/Content/Edit', [
            "title" => __($this->option),
            "subtitle" => __('contenido_editar').' '.ucwords($content->name),
            "module" => $this->module,
            "slug" => 'contents',
            "availableLocales" => LocaleTrait::availableLocales(),
            "content_" => $content,
            "titles" => $titles,
            "tags" => $tags,
            "excerpts" => $excerpts,
            "contents" => $contents,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 6. Actualizar contenido.
     */
    public function update(ContentUpdateRequest $request, Content $content){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $code = Str::slug($request->name);
        $arrCode = ['code' => $code];
        //Validamos el código:
        $validateCode = $this->validateCode($arrCode, $content->id);
        if($validateCode->fails()){
            return redirect()->route('contents.create')
                ->withErrors($validateCode)
                ->withInput();
        }  

        //Tratamiento de fechas:
        $rawStart = $request->input('published_at');
        $publishedAt = $rawStart !== ''
            ? ($locale[0] !== 'en'
                ? $this->convertDate($rawStart, false)
                : $rawStart
            )
            : null;

        $rawEnd = $request->input('published_end');
        $publishedEnd = $rawEnd !== ''
            ? ($locale[0] !== 'en'
                ? $this->convertDate($rawEnd, false)
                : $rawEnd
            )
            : null;

        //Inyectamos las fechas ya convertidas en el request
        $request->merge([
            'published_at'  => $publishedAt,
            'published_end' => $publishedEnd,
        ]);

        //Validación:
        $validated = $request->validated();

        //Contenido multiidioma:
        $arrTitles = [];
        $arrTags = [];
        $arrExcerpts = [];
        $arrContents = [];

        foreach(LocaleTrait::availableLocales() as $lang){
            $title = 'title_'.$lang;
            $tags = 'tags_'.$lang;
            $excerpt = 'excerpt_'.$lang;
            $content_ = 'content_'.$lang;

            $arrTitles[$lang] = $request->input($title);
            $arrTags[$lang] = $request->input($tags);
            $arrExcerpts[$lang] = $request->input($excerpt);
            $arrContents[$lang] = $request->input($content_);
        }

        $strTitle = serialize($arrTitles);
        $strTag = serialize($arrTags);
        $strExcerpt = serialize($arrExcerpts);
        $strContent = serialize($arrContents);

        $content->name = $request->input('name');
        $content->slug = Str::slug($request->input('name'));
        $content->code = $code;
        $content->title = $strTitle;
        $content->tags = $strTag;
        $content->excerpt = $strExcerpt;
        $content->content = $strContent;
        $content->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN)? 1:0;
        $content->observations = $request->observations;
        $content->published_at = $publishedAt;
        $content->published_end = $publishedEnd;
        $content->updated_by = Auth::user()->id;
        $content->save();

        //Generar .json de contenidos:
        $this->jsonContents();

        return redirect()->route('contents.edit', $content->id)
            ->with('msg', __('contenido_actualizado_msg'));
    }

    /**
     * 7. Eliminar contenido.
     */
    public function destroy(Content $content){
        $content->delete();

        //Generar .json de contenidos:
        $this->jsonContents();

        return redirect()->route('contents.index')->with('msg', __('contenido_eliminado'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $content = Content::find($request->id);

        if(!$content){
            return response()->json(['error' => __('contenido_no_encontrado')], 404);
        }
        
        $content->status = !$content->status;
        $content->save(); 

        //Generar .json de contenidos:
        $this->jsonContents();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $content->status
        ]);
    }
}
