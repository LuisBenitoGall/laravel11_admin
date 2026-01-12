<?php

namespace App\Models;

use Illuminate\Http\Request;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Support\Filters\AdHocFilterApplier;
use Spatie\Permission\Traits\HasRoles;

//Concerns:
use App\Concerns\HasCategories;
use App\Concerns\HasSalutation;

//Traits:
use App\Traits\HasCompanyPermissions;

class User extends Authenticatable implements MustVerifyEmail{
    /**
     * 1. Get the attributes that should be cast.
     * 2. Empresas del usuario.
     * 2.1. Relación eloquent de empresas del usuario.
     * 3. Método de Super Admin.
     * 4. Avatar del usuario.
     * 5. Teléfonos del usuario.
     * 6. Nombre y apellidos del usuario.
     * 7. Guardar firma de usuario.
     * 8. Normalización email.
     * 9. Normalización nif.
     * 10. Direcciones de usuario.
     * 11. Categorías de usuario.
     * 12. Filtros avanzados.
     * 13. Scope: sólo usuarios que pueden recibir emails de marketing.
     * 14. Helper de instancia, por si algún día lo quieres usar en lógica suelta.
     */
    
    use HasFactory, Notifiable, SoftDeletes, HasRoles, HasCompanyPermissions;
    use HasCategories;
    use HasSalutation;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'surname',
        'salutation',
        'email',
        'password',
        'birthday',
        'nif',
        'signature',
        'isAdmin',
        'status'
    ];

    protected $categoryModuleSlug = 'users';

    protected $appends = ['salutation_label', 'salutation_abbr', 'full_name'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * 1. Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array{
        return [
            'email_verified_at' => 'datetime',
            'birthday'          => 'date:Y-m-d',
            'password'          => 'hashed',
            'isAdmin'           => 'boolean',
            'status'            => 'integer'
        ];
    }

    /**
     * 2. Empresas del usuario.
     */
    public function userCompanies(){
        $data = Company::select('companies.id', 'companies.name', 'companies.tradename', 'companies.logo', 'companies.nif', 'companies.status', 'user_companies.position')
            ->join('user_companies', 'companies.id', '=', 'user_companies.company_id')
            ->where('user_companies.user_id', $this->id)
            ->where('companies.status', 1)
            ->get();

        return $data;
    }

    /**
     * 2.1. Relación eloquent de empresas del usuario.
     */
    public function companies(){
        return $this->belongsToMany(Company::class, 'user_companies')
            ->withPivot('position')
            ->where('companies.status', 1);
    }

    /**
     * 3. Método de Super Admin.
     */
    public function isSuperAdmin(): bool{
        return $this->hasRole('Super Admin');
    }

    /**
     * 4. Avatar del usuario.
     */
    public function avatar(){
        return $this->hasOne(UserImage::class)->where('featured', 1)->where('public', 1);
    }

    /**
     * 5. Teléfonos del usuario.
     */
    public function phones(){
        return $this->morphMany(\App\Models\Phone::class, 'phoneable')
        ->orderByDesc('is_primary');
    }

    /**
     * 6. Nombre y apellidos del usuario.
     */
    public function getFullNameAttribute(){
        $salutation = $this->salutation? HasSalutation::salutationAbbrOf($this->salutation):false;

        if($salutation){
            return "{$salutation} {$this->name} {$this->surname}";
        }else{
            return "{$this->name} {$this->surname}";    
        }
    }

    /**
     * 7. Guardar firma de usuario.
     */
    public static function saveUserSignature($request){
        if(!$request->hasFile('signature')) return false;

        /** @var UploadedFile $file */
        $file = $request->file('signature');

        // Validaciones básicas. Para serio: muévelo a un FormRequest.
        $mime = $file->getMimeType() ?: '';
        $size = $file->getSize() ?? 0;

        $allowed = ['image/png','image/jpeg','image/jpg','image/webp','application/pdf'];
        if (!in_array($mime, $allowed, true)) return false;
        if ($size > 2 * 1024 * 1024) return false; // 2MB

        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $filename = 'signature_'.Str::uuid().'.'.$ext;

        // Usa un disk controlado (config/filesystems.php)
        $path = $file->storeAs('signatures', $filename, ['disk' => 'public']);

        return $filename ?: false;
    }

    /**
     * 8. Normalización email.
     */
    public function setEmailAttribute($value): void{
        $this->attributes['email'] = is_string($value)
            ? mb_strtolower(trim($value))
            : $value;
    }

    /**
     * 9. Normalización nif.
     */
    public function setNifAttribute($value): void{
        $this->attributes['nif'] = is_string($value)
            ? mb_strtoupper(trim($value))
            : $value;
    }

    /**
     * 10. Direcciones de usuario.
     */
    public function addresses()
    {
        return $this->hasMany(UserAddress::class, 'user_id');
    }

    /**
     * 11. Categorías de usuario.
     */
    public function categories()
    {
        return $this->morphToMany(Category::class, 'categorizable');
    }

    /**
     * 12. Filtros avanzados.
     */
    public function scopeApplyAdhocFilters(Builder $query, Request $request, array $definitions): Builder
    {
        AdHocFilterApplier::apply($query, $request, $definitions);
        return $query;
    }

    /**
     * 13. Scope: sólo usuarios que pueden recibir emails de marketing.
     */
    public function scopeAcceptsMarketingEmails(Builder $query): Builder
    {
        return $query
            ->where('accept_emails', true)
            ->where('status', 1)
            ->whereNotNull('email')
            ->where('email', '!=', '');
    }

    /**
     * 14. Helper de instancia, por si algún día lo quieres usar en lógica suelta.
     */
    public function canReceiveMarketingEmails(): bool
    {
        return (bool) $this->accept_emails
            && (int) $this->status === 1
            && !empty($this->email);
    }

    public function emails()
    {
        return $this->hasMany(\App\Models\UserEmail::class);
    }

}
