<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use File;

//Concerns:
use App\Concerns\HasCategories;

//Models:
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class Company extends Model{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Guardar empresa.
     * 4. Guardar role por empresa.
     * 5. Roles básicos por empresa.
     * 6. Guardar logo de empresa.
     * 7. Normalizar NIF.
     * 8. Normalizar slug.
     * 9. Módulos de la empresa.
     */

    use HasFactory;
    use SoftDeletes;
    use HasCategories;

    protected $table = 'companies';

    protected $dates = ['deleted_at'];

    protected $fillable = ['id', 'mother_co', 'mother_co_num', 'is_community', 'name', 'slug', 'tradename', 'acronym', 'logo', 'nif', 'status', 'created_by', 'updated_by'];

    protected $casts = [
        'is_community' => 'boolean',
        'is_ute'       => 'boolean',
        'status'       => 'boolean',
        'ute_start_at' => 'datetime',
        'ute_finish_at'=> 'datetime',
        'deleted_at'   => 'datetime',
    ];

    protected $categoryModuleSlug = 'companies';

    /**
     * 1. Creada por.
     */
    public function createdBy(){
       return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Actualizada por.
     */
    public function updatedBy(){
       return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * 3. Guardar empresa.
     */
    public static function saveCompany($request){
        $slug = Str::slug($request->name);

        $co = new Company();
        $co->name = $request->name;
        $co->slug = $slug;
        $co->tradename = $request->tradename;
        $co->nif = $request->nif;
        $co->is_ute = $request->is_ute? true:false;
        $co->created_by = Auth::user()->id;
        $co->updated_by = Auth::user()->id;   
        
        //Guardando logo:
        $filename = self::saveCompanyLogo($request, $slug);

        $co->save();

        //Cuenta de la empresa:
        

        //Roles de la empresa:
        

        //Creando centro de trabajo por defecto:
        $wp = new Workplace();
        $wp->company_id = $co->id;
        $wp->name = ucfirst(trans('textos.sede')).' '.$co->name;
        $wp->slug = Str::slug(trans('textos.sede'));
        $wp->featured = 1;
        $wp->save();

        //Vinculación a empresa:
        if($request->auto_link){
            UserCompany::firstOrCreate(
                ['user_id' => Auth::user()->id, 'company_id' => $co->id,],
                ['user_id' => Auth::user()->id, 'company_id' => $co->id]
            );
        } 

        return $co;
    }

    /**
     * 4. Guardar role por empresa.
     */
    public static function saveCompanyRole($name, $company_id, $description = NULL, $universal = false){
        $role = new Role();
        $role->name = !$universal? $company_id . '/' . $name:$name;
        $role->guard_name = 'web';
        $role->description = $description;
        $role->company_id = !$universal? $company_id:NULL;
        $role->universal = $universal? $universal:false;
        $role->save();

        return $role;
    }

    /**
     * 5. Roles básicos por empresa.
     */
    public function setCompanyRoles($set_permissions = true, $arr = false){


    }

    /**
     * 6. Guardar logo de empresa.
     */
    public static function saveCompanyLogo($request, string $slug){
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
        $file->storeAs('companies', $filename, ['disk' => 'public']) ?: null;

        return $filename;
    }

    /**
     * 7. Normalizar NIF.
     */
    public function setNifAttribute($value): void{
        $this->attributes['nif'] = is_string($value) ? mb_strtoupper(trim($value)) : $value;
    }

    /**
     * 8. Normalizar slug.
     */
    public function setSlugAttribute($value): void{
        $this->attributes['slug'] = is_string($value) ? Str::slug($value) : $value;
    }

    /**
     * 9. Módulos de la empresa.
     */
    public function modules(){
        return $this->belongsToMany(\App\Models\Module::class, 'company_modules')
        ->using(\App\Models\Pivots\CompanyModulePivot::class)
        ->withPivot(['deleted_at','created_at','updated_at'])
        ->withTimestamps()
        ->wherePivotNull('deleted_at');
    }

    public function mother(){ return $this->belongsTo(self::class, 'mother_co'); }
    public function children(){ return $this->hasMany(self::class, 'mother_co'); }

    /** Helpers de consulta habituales */
    public function scopeActive($q) { return $q->where('status', true); }

    public function scopeTuteladasPor($q, int $motherId) {
        return $q->where('mother_co', $motherId);
    }
}
