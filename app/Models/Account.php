<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Account extends Model{
    /**
     * 1. Guardar cuenta.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'accounts';

    protected $fillable = ['name','slug','description','rate','duration','status'];

    protected function casts(): array {
        return [
            'rate'    => 'decimal:2',
            'status'  => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    // Normalizadores mínimos
    public function setNameAttribute($v): void { $this->attributes['name'] = is_string($v) ? trim($v) : $v; }
    public function setSlugAttribute($v): void { $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v; }

    /**
     * 1. Guardar cuenta.
     */
    public static function saveAccount($request){
        $slug = Str::slug($request->name);

        // Evita duplicados por las buenas (además del UNIQUE en BD)
        if (static::where('slug', $slug)->exists()) {
            $alert = __('valor_repetido');
            return redirect()->route('accounts.create')->with(compact('alert'));
        }

        $a = new static();
        $a->name        = $request->name;
        $a->slug        = $slug;
        $a->description = $request->description;
        $a->rate        = $request->rate ?? 0;
        $a->duration    = $request->duration;
        $a->status      = (bool) $request->status;
        $a->save();

        return $a;
    }
}
