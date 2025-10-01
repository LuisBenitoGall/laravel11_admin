<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class Functionality extends Model{
    /**
     * 1. Funcionalidades por módulo.
     * 2. Filtrado de funcionalidades por módulo.
     * 3. Funcionalidades join módulos.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'functionalities';

    protected $fillable = ['name', 'slug', 'label', 'module_id'];

    // Relaciones
    public function module(){ return $this->belongsTo(Module::class); }

    // Normalizadores mínimos
    public function setNameAttribute($v){ $this->attributes['name'] = is_string($v) ? trim($v) : $v; }
    public function setLabelAttribute($v){ $this->attributes['label'] = is_string($v) ? trim($v) : $v; }
    public function setSlugAttribute($v){ $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v; }

    /**
     * 1. Funcionalidades por módulo.
     */
    public static function getByModule($moduleId){
        return static::where('module_id', $moduleId)
            ->orderBy('label','ASC')
            ->get();
    }

    /**
     * 2. Filtrado de funcionalidades por módulo.
     *    No devuelvas Response desde el modelo; deja eso al controlador.
     */
    public function filteredData(Request $request){
        $query = static::query();

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->input('module_id'));
        }
        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->input('name').'%');
        }
        if ($request->filled('label')) {
            $query->where('label', 'like', '%'.$request->input('label').'%');
        }

        // Devuelve colección; el controller transforma a JSON
        return $query->orderBy('label','ASC')->get();
    }

    /**
     * 3. Funcionalidades join módulos.
     *    Se descartan los permisos exclusivos de Super Admin.
     */
    public static function permissionsJoinModule(){
        $exceptions = config('constants.PERMISSIONS_OFF_');

        return static::select('functionalities.*', 'modules.level')
            ->join('modules', 'functionalities.module_id', '=', 'modules.id')
            ->whereNotIn('functionalities.slug', $exceptions)
            ->orderBy('functionalities.label', 'ASC')
            ->get();
    }
}
