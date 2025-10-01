<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class StockMovement extends Model{
    use HasFactory, SoftDeletes;

    protected $table = 'stock_movements';

    protected $fillable = [
        'name','slug','acronym','sign','domestic_consumption','limit','translations','explanation','status'
    ];

    protected function casts(): array {
        return [
            'domestic_consumption' => 'boolean',
            'status'               => 'boolean',
            'translations'         => 'array',
            'limit'                => 'integer',
            'deleted_at'           => 'datetime',
        ];
    }

    // Normalizadores
    public function setNameAttribute($v): void {
        $this->attributes['name'] = is_string($v) ? trim($v) : $v;
    }
    public function setSlugAttribute($v): void {
        $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v;
    }
    public function setAcronymAttribute($v): void {
        $this->attributes['acronym'] = strtoupper(trim((string)$v));
    }
    public function setSignAttribute($v): void {
        $s = strtoupper(trim((string)$v));
        $this->attributes['sign'] = in_array($s, ['+','-','T'], true) ? $s : null;
    }

    // Scopes útiles
    public function scopeActive($q){ return $q->where('status', true); }
    public function scopeInflow($q){ return $q->where('sign', '+'); }
    public function scopeOutflow($q){ return $q->where('sign', '-'); }
    public function scopeTransfer($q){ return $q->where('sign', 'T'); }
}
