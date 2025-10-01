<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Province extends Model{
    /**
     * 1. Poblaciones de la provincia.
     * 2. Guardar provincia.
     */
    use HasFactory, SoftDeletes;

    protected $table = 'provinces';

    protected $fillable = ['name','slug','country_id','status'];

    protected function casts(): array {
        return ['status'=>'boolean'];
    }

    // Normalizadores
    public function setSlugAttribute($v): void { $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v; }
    public function setNameAttribute($v): void { $this->attributes['name'] = is_string($v) ? trim($v) : $v; }

    // Relaciones
    public function country(){ return $this->belongsTo(Country::class); }

    /**
     * 1. Poblaciones de la provincia.
     */
    public function towns(){
        return $this->hasMany(Town::class);
    }

    /**
     * 2. Guardar provincia.
     */
    public static function saveProvince($request){
        $slug = Str::slug($request->name);

        if (static::where('country_id', $request->country)
                ->where('slug', $slug)->exists()) {
            $alert = __('valor_repetido');
            return redirect()->route('provinces.create')->with(compact('alert'));
        }

        $p = new static();
        $p->name       = $request->name;
        $p->slug       = $slug;
        $p->country_id = $request->country;
        $p->status     = (bool) $request->status;
        $p->save();

        return $p;
    }
}
