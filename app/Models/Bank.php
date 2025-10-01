<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class Bank extends Model{
    /**
     * 1. Importación de datos desde .json.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'banks';

    protected $fillable = [
        'name','slug','tradename','swift','lei','eu_code','supervisor_code','status'
    ];

    protected function casts(): array {
        return ['status' => 'boolean'];
    }

    /* Normalizadores */
    public function setSlugAttribute($v): void {
        $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v;
    }

    public function setSwiftAttribute($v): void {
        if ($v === null) { $this->attributes['swift'] = null; return; }
        $swift = strtoupper(preg_replace('/[^A-Z0-9]/', '', (string)$v));
        if ($swift === '') { $this->attributes['swift'] = null; return; }
        if (strlen($swift) === 8)   { $swift .= 'XXX'; }          // completa a 11
        if (strlen($swift) !== 11)  { $swift = null; }            // invalida formatos raros
        $this->attributes['swift'] = $swift;
    }

    public function setLeiAttribute($v): void {
        if ($v === null) { $this->attributes['lei'] = null; return; }
        $lei = strtoupper(preg_replace('/[^A-Z0-9]/', '', (string)$v));
        if (strlen($lei) !== 20) { $lei = null; }                 // LEI debe tener 20 chars
        $this->attributes['lei'] = $lei;
    }

    /**
     * 1. Importación de datos desde .json.
     */
    public static function import(): int {
        $path = storage_path('json/banks.json');
        if (!File::exists($path)) return 0;

        $rows = json_decode(File::get($path), true);
        if (!is_array($rows) || empty($rows)) return 0;

        // Deduplicación: prioriza clave SWIFT, si no LEI, si no SLUG
        $bySwift = [];
        $byLei   = [];
        $bySlug  = [];

        foreach ($rows as $r) {
            $name       = isset($r['name']) ? trim($r['name']) : null;
            if (!$name) continue;

            $slug       = Str::slug($name);
            $tradename  = $r['tradename'] ?? null;

            // Normaliza SWIFT y LEI igual que los mutators
            $swift = isset($r['swift']) ? strtoupper(preg_replace('/[^A-Z0-9]/', '', (string)$r['swift'])) : null;
            if ($swift && strlen($swift) === 8) { $swift .= 'XXX'; }
            if ($swift && strlen($swift) !== 11) { $swift = null; }

            $lei = isset($r['lei']) ? strtoupper(preg_replace('/[^A-Z0-9]/', '', (string)$r['lei'])) : null;
            if ($lei && strlen($lei) !== 20) { $lei = null; }

            $payload = [
                'name'            => $name,
                'slug'            => $slug,
                'tradename'       => $tradename,
                'swift'           => $swift,
                'lei'             => $lei,
                'eu_code'         => $r['eu_code'] ?? null,
                'supervisor_code' => $r['supervisor_code'] ?? null,
                'status'          => false,
                'created_at'      => now(),
                'updated_at'      => now(),
            ];

            if ($swift) { $bySwift[$swift] = $payload; continue; }
            if ($lei)   { $byLei[$lei]     = $payload; continue; }
            $bySlug[$slug] = $payload;
        }

        $count = 0;

        DB::transaction(function () use (&$count, $bySwift, $byLei, $bySlug) {
            if (!empty($bySwift)) {
                static::upsert(
                    array_values($bySwift),
                    ['swift'],
                    ['name','slug','tradename','lei','eu_code','supervisor_code','status','updated_at']
                );
                $count += count($bySwift);
            }
            if (!empty($byLei)) {
                static::upsert(
                    array_values($byLei),
                    ['lei'],
                    ['name','slug','tradename','swift','eu_code','supervisor_code','status','updated_at']
                );
                $count += count($byLei);
            }
            if (!empty($bySlug)) {
                static::upsert(
                    array_values($bySlug),
                    ['slug'],
                    ['name','tradename','swift','lei','eu_code','supervisor_code','status','updated_at']
                );
                $count += count($bySlug);
            }
        });

        return $count;
    }
}
