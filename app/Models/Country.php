<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Country extends Model{
    /**
     * 1. Provincias del país.
     * 2. Guardar país.
     */
    use HasFactory, SoftDeletes;

    protected $table = 'countries';

    protected $fillable = ['name','slug','code','alfa2','alfa3','flag','status'];

    protected function casts(): array {
        return ['status'=>'boolean'];
    }

    // Normalizadores
    public function setSlugAttribute($v): void { $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v; }
    public function setNameAttribute($v): void { $this->attributes['name'] = is_string($v) ? trim($v) : $v; }
    public function setCodeAttribute($v): void { $this->attributes['code'] = is_string($v) ? strtoupper(trim($v)) : $v; }
    public function setAlfa2Attribute($v): void { $this->attributes['alfa2'] = is_string($v) ? strtoupper(trim($v)) : $v; }
    public function setAlfa3Attribute($v): void { $this->attributes['alfa3'] = is_string($v) ? strtoupper(trim($v)) : $v; }

    /**
     * 1. Provincias del país.
     */
    public function provinces(){
        return $this->hasMany(Province::class);
    }

    /**
     * 2. Guardar país.
     */
    public static function saveCountry($request){
        $slug = Str::slug($request->name);

        if (static::where('slug',$slug)->exists()) {
            $alert = __('valor_repetido');
            return redirect()->route('countries.create')->with(compact('alert'));
        }

        $p = new static();
        $p->name   = $request->name;
        $p->slug   = $slug;
        $p->code   = $request->code;
        $p->alfa2  = $request->alfa2;
        $p->alfa3  = $request->alfa3;
        $p->flag   = $request->flag;
        $p->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN);
        $p->save();

        return $p;
    }
}
