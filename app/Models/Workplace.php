<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use File;

class Workplace extends Model{
    /**
     * 1. Guardar centro de trabajo.
     * 2. Guardar logo de centro.
     */

    use SoftDeletes;

    protected $table = 'workplaces';

    protected $fillable = [
        'company_id','name','slug','featured','logo','address','cp','town_id','nif','website','description','status'
    ];

    protected function casts(): array {
        return [
            'featured' => 'boolean',
            'status'   => 'boolean'
        ];
    }

    // Normalizadores
    public function setSlugAttribute($v): void {
        $this->attributes['slug'] = is_string($v) ? Str::slug($v) : $v;
    }
    public function setNifAttribute($v): void {
        if (is_null($v)) { $this->attributes['nif'] = null; return; }
        $val = strtoupper(preg_replace('/[^0-9A-Z]+/', '', (string) $v));
        $this->attributes['nif'] = $val;
    }

    // Relaciones
    public function company(){ return $this->belongsTo(Company::class); }
    public function town()   { return $this->belongsTo(Town::class); }

    // Scopes
    public function scopeActive($q){ return $q->where('status', true); }
    public function scopeForCompany($q, int $companyId){ return $q->where('company_id', $companyId); }

    /**
     * 1. Guardar centro de trabajo.
     */
    public static function saveWorkplace($request){
        $companyId = $request->company_id? $request->company_id:session('currentCompany'); 

        $slug = Str::slug($request->name);

        $wk = new Workplace();
        $wk->name = $request->name;
        $wk->slug = $slug;
        $wk->company_id = $companyId;
        $wk->status = $request->status? true:false;
        $wk->save();

        return $wk;
    }

    /**
     * 2. Guardar logo de centro.
     */
    public static function saveWorkplaceLogo($request, string $slug){
        if (!$request->hasFile('logo')) return null;

        $file = $request->file('logo');
        $mime = $file->getMimeType() ?: '';
        $size = $file->getSize() ?? 0;

        $allowed = ['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml'];
        if (!in_array($mime, $allowed, true)) return null;
        if ($size > 3 * 1024 * 1024) return null; // 3MB

        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $filename = $slug.'_'.time().'.'.$ext;

        // Usa el disk 'public' (config/filesystems.php)
        $file->storeAs('workplaces', $filename, ['disk' => 'public']) ?: null;

        return $filename;
    }
}
