<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProductPattern extends Model{
    /**
     * 1. Creado por.
     * 2. Actualizado por.
     * 3. Guardar patrón.
     */
    use SoftDeletes;

    protected $table = 'product_patterns';

    protected $fillable = [
        'company_id','name','slug','pattern','status','created_by','updated_by'
    ];

    protected function casts(): array {
        return [
            'status'     => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    // Normalizadores
    public function setNameAttribute($v){ $this->attributes['name'] = is_string($v) ? trim($v) : $v; }
    public function setSlugAttribute($v){ $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v; }
    public function setPatternAttribute($v){ $this->attributes['pattern'] = is_string($v) ? trim($v) : $v; }

    /**
     * 1. Creado por.
     */
    public function createdBy(){ return $this->belongsTo(User::class, 'created_by'); }

    /**
     * 2. Actualizado por.
     */
    public function updatedBy(){ return $this->belongsTo(User::class, 'updated_by'); }

    public function company(){ return $this->belongsTo(Company::class); }

    /**
     * 3. Guardar patrón.
     */
    public static function savePattern($request){
        $companyId = (int) session('currentCompany');
        $slug = Str::slug($request->name);

        $p = new self();
        $p->company_id = $companyId;
        $p->name       = $request->name;
        $p->slug       = $slug;
        // Añadir ndigits a los segmentos de tipo digits
        $segments = $request->segments;
        foreach ($segments as &$seg) {
            if ($seg['type'] === 'digits') {
                $seg['ndigits'] = (int) $request->ndigits;
            }
        }
        $p->pattern    = json_encode($segments); // Guardar como JSON
        $p->status     = (bool) ($request->status ?? true);
        $p->created_by = Auth::id();
        $p->updated_by = Auth::id();
        $p->save();

        return $p;
    }

    // Scopes útiles
    public function scopeForCompany($q, int $companyId){ return $q->where('company_id', $companyId); }
    public function scopeActive($q){ return $q->where('status', true); }
    public function scopeBySlug($q, string $slug){ return $q->where('slug', $slug); }
}
