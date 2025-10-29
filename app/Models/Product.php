<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

// Concerns:
use App\Concerns\HasCategories;
use App\Concerns\HasProducts;

class Product extends Model{
    /**
     * 1. Creado por.
     * 2. Actualizado por.
     * 3. Guardar producto.
     */
    use SoftDeletes, HasCategories, HasProducts;

    protected $table = 'products';

    protected $fillable = [
        'company_id','name','slug','ref','manual_ref','type','tags',
        'description','long_description','calculated_by_percent','iva',
        'batch','stock_management','on_sale','production_status',
        'status','created_by','updated_by'
    ];

    protected function casts(): array{
        return [
            'tags'                 => 'array',
            'calculated_by_percent'=> 'decimal:2',
            'iva'                  => 'decimal:2',
            'batch'                => 'boolean',
            'stock_management'     => 'boolean',
            'on_sale'              => 'boolean',
            'status'               => 'boolean',
            'production_status'    => 'integer',
            'deleted_at'           => 'datetime',
        ];
    }

    /**
     * 1. Creado por.
     */
    public function createdBy(){
       return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Actualizado por.
     */
    public function updatedBy(){
       return $this->belongsTo(User::class, 'updated_by');
    }

    // Relaciones útiles
    public function company(){ return $this->belongsTo(Company::class); }

    // Normalizadores
    public function setNameAttribute($v){ $this->attributes['name'] = is_string($v) ? trim($v) : $v; }
    public function setSlugAttribute($v){ $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v; }
    public function setTypeAttribute($v){
        $t = strtolower((string)$v);
        $this->attributes['type'] = in_array($t, ['p','s'], true) ? $t : null;
    }

    /**
     * 3. Guardar producto.
     */
    public static function saveProduct($request, int $companyId){
        if ($companyId <= 0) {
            throw new \InvalidArgumentException('companyId inválido.');
        }

        $baseSlug  = Str::slug($request->name ?? '');
        $slug      = $baseSlug !== '' ? $baseSlug : Str::random(8);

        // Garantiza slug único por empresa (vivo)
        $i = 0;
        do {
            $try = $i === 0 ? $slug : "{$slug}-{$i}";
            $exists = static::where('company_id', $companyId)
                ->where('slug', $try)
                ->whereNull('deleted_at')
                ->exists();
            if (!$exists) { $slug = $try; break; }
            $i++;
        } while ($i < 1000); // si llegas a 1000, tenemos otros problemas

        $p = new self();
        $p->company_id            = $companyId;
        $p->name                  = $request->name;
        $p->slug                  = $slug;
        $p->ref                   = $request->ref ?? null;
        $p->manual_ref            = $request->manual_ref ?? null;
        $p->type                  = $request->type;
        $p->tags                  = $request->tags ?? null;
        $p->description           = $request->description ?? null;
        $p->long_description      = $request->long_description ?? null;
        $p->calculated_by_percent = $request->calculated_by_percent ?? null;
        $p->iva                   = $request->iva ?? null;
        $p->batch                 = (bool) ($request->batch ?? false);
        $p->stock_management      = (bool) ($request->stock_management ?? false);
        $p->on_sale               = (bool) ($request->on_sale ?? true);
        $p->production_status     = $request->production_status ?? null;
        $p->status                = (bool) ($request->status ?? false);
        $p->created_by            = Auth::id();
        $p->updated_by            = Auth::id();
        $p->save();

        return $p;
    }

    // Scopes útiles
    public function scopeForCompany($q, int $companyId){ return $q->where('company_id', $companyId); }
    public function scopeActive($q){ return $q->where('status', true); }
    public function scopeProducts($q){ return $q->where('type', 'p'); }
    public function scopeServices($q){ return $q->where('type', 's'); }
    public function scopeSearchName($q, string $needle){
        return $q->where('name', 'like', '%'.$needle.'%');
    }
}
