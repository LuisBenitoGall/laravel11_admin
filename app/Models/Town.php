<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Town extends Model{
    /**
     * 1. Guardar población.
     */
    use HasFactory, SoftDeletes;

    protected $table = 'towns';

    protected $fillable = ['name','slug','province_id','status'];

    protected function casts(): array {
        return ['status'=>'boolean'];
    }

    // Normalizadores
    public function setSlugAttribute($v): void { $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v; }
    public function setNameAttribute($v): void { $this->attributes['name'] = is_string($v) ? trim($v) : $v; }

    // Relaciones
    public function province(){ return $this->belongsTo(Province::class); }

    /**
     * 1. Guardar población.
     */
    public static function saveTown($request){
        $slug = Str::slug($request->name);

        if (static::where('province_id', $request->province)
                ->where('slug', $slug)->exists()) {
            $alert = __('valor_repetido');
            return redirect()->route('towns.create')->with(compact('alert'));
        }

        $t = new static();
        $t->name        = $request->name;
        $t->slug        = $slug;
        $t->province_id = $request->province;
        $t->status      = (bool) $request->status;
        $t->save();

        return $t;
    }
}
