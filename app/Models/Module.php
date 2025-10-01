<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

// Models:
use Spatie\Permission\Models\Permission;

class Module extends Model{
    /**
     * 1. Funcionalidades del módulo.
     * 2. Módulo por slug.
     * 3. Empresas del módulo.
     * 4. Guardar módulo.
     * 5. Creado por.
     * 6. Actualizado por.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'modules';

    protected $fillable = [
        'name','slug','label','color','icon','level','translations','explanation','status',
        'created_by','updated_by',
    ];

    protected function casts(): array {
        return [
            'translations' => 'array',   // JSON <-> array
            'status'       => 'boolean',
            'level'        => 'integer',
        ];
    }

    /** Normalizadores mínimos */
    public function setSlugAttribute($value): void {
        $this->attributes['slug'] = is_string($value) ? Str::slug($value) : $value;
    }

    /** 
     * 1. Funcionalidades del módulo.
     */
    public function functionalities(){
        return $this->hasMany(Functionality::class);
    }

    /**
     * 2. Módulo por slug.
     */
    public static function moduleBySlug($slug){
        return static::where('slug', $slug)->first();
    }

    /**
     * 3. Empresas del módulo.
     */
    public function company(){
        return $this->belongsToMany(\App\Models\Company::class, 'company_modules')
        ->using(\App\Models\Pivots\CompanyModulePivot::class)
        ->withPivot(['deleted_at','created_at','updated_at'])
        ->withTimestamps()
        ->wherePivotNull('deleted_at');
    }

    /**
     * 4. Guardar módulo.
     */
    public static function saveModule($request) {
        $slug = Str::slug($request->name);

        // El valor debe ser único (además del UNIQUE de BD)
        if (static::where('slug', $slug)->exists()){
            $alert = __('valor_repetido');
            return redirect()->route('modules.create')->with(compact('alert'));
        }

        $m = new static();
        $m->name        = strtolower(trim($request->name));
        $m->slug        = $slug;
        $m->label       = strtolower(trim($request->name));
        $m->color       = $request->color;
        $m->icon        = $request->icon;
        $m->level       = $request->level;
        $m->status      = (bool) $request->status;
        $m->created_by  = Auth::id();
        $m->updated_by  = Auth::id();
        $m->save();

        // Crear permisos del módulo.
        Permission::firstOrCreate(['name' => 'module_'.$m->slug], ['guard_name' => 'web']);

        return $m;
    }

    /**
     * 5. Creado por.
     */
    public function createdBy(){
       return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 6. Actualizado por.
     */
    public function updatedBy(){
       return $this->belongsTo(User::class, 'updated_by');
    }
}
