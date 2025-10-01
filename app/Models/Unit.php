<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class Unit extends Model{
    /**
     * 1. Importación unidades de venta desde .json.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'units';

    protected $fillable = ['name', 'slug', 'symbol', 'translations', 'status'];

    protected function casts(): array {
        return [
            'translations' => 'array',
            'status'       => 'boolean',
            'deleted_at'   => 'datetime',
        ];
    }

    /* Normalizadores */
    public function setNameAttribute($v): void {
        $this->attributes['name'] = is_string($v) ? trim($v) : $v;
    }
    public function setSlugAttribute($v): void {
        $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v;
    }
    public function setSymbolAttribute($v): void {
        if ($v === null) { $this->attributes['symbol'] = null; return; }
        // Quita espacios y normaliza mayúsculas (ej. "kg" -> "KG", "m²" se queda "M²")
        $sym = trim((string)$v);
        // Convierte letras a mayúscula, respeta símbolos Unicode
        $this->attributes['symbol'] = mb_strtoupper($sym, 'UTF-8');
    }

    /**
     * 1. Importación unidades de venta desde .json.
     *    Idempotente: upsert por slug; no truncamos nada.
     */
    public static function import(): int {
        $path = storage_path('json/units.json');
        if (!File::exists($path)) return 0;

        $rows = json_decode(File::get($path), true);
        if (!is_array($rows) || empty($rows)) return 0;

        $payloads = [];
        foreach ($rows as $u){
            $name  = isset($u['name']) ? trim($u['name']) : null;
            if (!$name) continue;

            $slug  = isset($u['slug']) && $u['slug'] !== '' ? Str::slug($u['slug']) : Str::slug($name);
            $sym   = isset($u['symbol']) ? trim((string)$u['symbol']) : '';
            $sym   = $sym === '' ? $slug : mb_strtoupper($sym, 'UTF-8');

            $payloads[$slug] = [
                'name'         => $name,
                'slug'         => $slug,
                'symbol'       => $sym,
                'translations' => $u['translations'] ?? null,
                'status'       => (bool)($u['status'] ?? true),
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }

        if (empty($payloads)) return 0;

        DB::transaction(function () use ($payloads) {
            static::upsert(
                array_values($payloads),
                ['slug'], // clave natural
                ['name','symbol','translations','status','updated_at']
            );
        });

        return count($payloads);
    }

    // Scopes útiles
    public function scopeActive($q){ return $q->where('status', true); }
    public function scopeBySlug($q, string $slug){ return $q->where('slug', $slug); }
}
