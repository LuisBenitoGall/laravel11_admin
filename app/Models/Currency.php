<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class Currency extends Model{
    /**
     * 1. Importación monedas desde .json.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'currencies';

    protected $fillable = ['name','slug','code','number','symbol','status'];

    protected function casts(): array {
        return ['status' => 'boolean'];
    }

    // Normalizadores
    public function setCodeAttribute($v): void {
        $this->attributes['code'] = is_string($v) ? mb_strtoupper(trim($v)) : $v;
    }
    public function setNumberAttribute($v): void {
        $num = is_string($v) ? preg_replace('/\D+/', '', $v) : (string) $v;
        $this->attributes['number'] = str_pad($num, 3, '0', STR_PAD_LEFT);
    }
    public function setSlugAttribute($v): void {
        $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v;
    }
    public function setNameAttribute($v): void {
        $this->attributes['name'] = is_string($v) ? trim($v) : $v;
    }

    /**
     * 1. Importación monedas desde .json.
     * Idempotente con upsert por 'code'.
     */
    public static function import(): int{
        $path = storage_path('json/currencies.json');
        if (!File::exists($path)) return 0;

        $data = json_decode(File::get($path), true) ?: [];
        if (!is_array($data) || empty($data)) return 0;

        $symbols = [
            'EUR'=>'€','USD'=>'$','AUD'=>'$','USN'=>'$','USS'=>'$','CAD'=>'$','GBP'=>'£','JPY'=>'¥',
            'CNY'=>'¥','INR'=>'₹','BRL'=>'R$','HKD'=>'HK$','PLN'=>'zł','SEK'=>'kr','NOK'=>'kr','DKK'=>'kr'
        ];

        $rows = [];
        foreach ($data as $c) {
            $alpha = isset($c['AlphabeticCode']) ? mb_strtoupper(trim($c['AlphabeticCode'])) : null;
            $name  = isset($c['Currency']) ? trim($c['Currency']) : null;

            $num = $c['NumericCode'] ?? null;
            $num = is_string($num) ? explode('.', $num)[0] : (string) $num;
            $num = str_pad(preg_replace('/\D+/', '', (string) $num), 3, '0', STR_PAD_LEFT);

            if (!$alpha || !$num || !$name) continue;

            $rows[] = [
                'name'       => $name,
                'slug'       => Str::slug($name),
                'code'       => $alpha,
                'number'     => $num,
                'symbol'     => $symbols[$alpha] ?? null,
                'status'     => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (empty($rows)) return 0;

        DB::transaction(function () use ($rows) {
            static::upsert(
                $rows,
                ['code'], // clave única
                ['name','slug','number','symbol','status','updated_at']
            );
        });

        return count($rows);
    }

    // Scopes
    public function scopeActive($q) { return $q->where('status', true); }
}
