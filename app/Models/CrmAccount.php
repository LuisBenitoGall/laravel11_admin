<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;

//Models:
use App\Models\Company;
use App\Models\Currency;
use App\Models\User;

class CrmAccount extends Model{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Guardar cuenta.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'crm_accounts';

    protected $fillable = [
        'company_id',
        'parent_account_id',
        'customer_provider_id',
        'linked_company_id',
        'name',
        'tradename',
        'tax_id',
        'website',
        'currency_id',
        'owner_id',
        'billing_street','billing_city','billing_state','billing_postal_code','billing_country_code',
        'shipping_street','shipping_city','shipping_state','shipping_postal_code','shipping_country_code',
        'status',
    ];

    protected $casts = [
        'status' => 'integer',
    ];

    /** Boot: scoping de multiempresa + candado a campos fiscales cuando hay enlace */
    protected static function booted(): void{
        // Si usas un "currentCompanyId()" centralizado, cámbialo aquí.
        static::creating(function (CrmAccount $model) {
            if (empty($model->company_id)) {
                $companyId = session('company_id');
                if (!$companyId) {
                    throw ValidationException::withMessages([
                        'company_id' => 'No hay empresa activa en la sesión.',
                    ]);
                }
                $model->company_id = $companyId;
            }
        });

        // Candado: no me edites fiscales si hay enlace a maestro
        static::saving(function (CrmAccount $model) {
            if ($model->isLinkedToMaster()) {
                $dirtyFiscal = $model->isDirty(['name','tradename','tax_id',
                    'billing_street','billing_city','billing_state','billing_postal_code','billing_country_code',
                    'shipping_street','shipping_city','shipping_state','shipping_postal_code','shipping_country_code'
                ]);

                if ($dirtyFiscal) {
                    throw ValidationException::withMessages([
                        'locked' => 'Esta cuenta está enlazada a un maestro. Edita los datos fiscales en el maestro correspondiente.',
                    ]);
                }
            }
        });
    }

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
     * 3. Guardar cuenta.
     */
    public static function saveAccount($request){
        $a = new CrmAccount();
        $a->company_id = session('currentCompany');
        $a->name = $request->name;
        $a->tradename = $request->tradename;

        $a->created_by = Auth::user()->id;
        $a->updated_by = Auth::user()->id; 
        $a->save();

        return $a;
    }




    /* -------------------- Relaciones -------------------- */

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_account_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_account_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    // Si tienes el modelo CustomerProvider, apúntalo aquí:
    public function customerProvider()
    {
        return $this->belongsTo(\App\Models\CustomerProvider::class, 'customer_provider_id');
    }

    public function linkedCompany()
    {
        return $this->belongsTo(Company::class, 'linked_company_id');
    }

    // Relación con otras entidades CRM (cuando las crees)
    public function contacts()
    {
        return $this->hasMany(\App\Models\Crm\CrmContact::class, 'account_id');
    }

    public function opportunities()
    {
        return $this->hasMany(\App\Models\Crm\CrmOpportunity::class, 'account_id');
    }

    // Timeline polimórfico típico
    public function activities()
    {
        return $this->morphMany(\App\Models\Crm\CrmActivity::class, 'related');
    }

    public function notes()
    {
        return $this->morphMany(\App\Models\Note::class, 'notetable');
    }

    public function attachments()
    {
        return $this->morphMany(\App\Models\Attachment::class, 'attachable');
    }

    // Tags si más adelante creas el tagging genérico
    public function tags()
    {
        return $this->morphToMany(\App\Models\Tag::class, 'taggable', 'taggables');
    }

    /* -------------------- Scopes útiles -------------------- */

    public function scopeCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeActive($query, bool $active = true)
    {
        return $query->where('status', $active ? 1 : 0);
    }

    public function scopeOwnedBy($query, ?int $userId)
    {
        return $userId ? $query->where('owner_id', $userId) : $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;

        $term = trim($term);
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('tradename', 'like', "%{$term}%")
              ->orWhere('tax_id', 'like', "%{$term}%")
              ->orWhere('website', 'like', "%{$term}%");
        });
    }

    /* -------------------- Helpers de dominio -------------------- */

    public function isLinkedToMaster(): bool{
        return (bool) ($this->customer_provider_id || $this->linked_company_id);
    }

    public function isActive(): bool{
        return (int) $this->status === 1;
    }

    
}
