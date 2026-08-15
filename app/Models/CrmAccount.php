<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use File;
use Carbon\Carbon;

//Models:
use App\Models\Company;
use App\Models\Currency;
use App\Models\User;
use App\Support\DataStandards\AccountNameNormalizer;
use App\Support\DataStandards\EmailNormalizer;
use App\Support\DataStandards\NifNormalizer;
use App\Support\DataStandards\PhoneNormalizer;
use App\Support\DataStandards\SlugNormalizer;
use App\Support\DataStandards\TextCleanupNormalizer;

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
        'nif',
        'tax_id',
        'website',
        'currency_id',
        'owner_id',
        'billing_street','billing_city','billing_state','billing_postal_code','billing_country_code',
        'shipping_street','shipping_city','shipping_state','shipping_postal_code','shipping_country_code',
        'external_id',
        'main_phone',
        'main_email',
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

        // Candado solo al ACTUALIZAR
        static::updating(function (CrmAccount $model) {
            if ($model->isLinkedToMaster()) {
                $dirtyFiscal = $model->isDirty([
                    'name','tradename','nif', // usa el campo real del modelo
                    //'billing_street','billing_city','billing_state','billing_postal_code','billing_country_code',
                    //'shipping_street','shipping_city','shipping_state','shipping_postal_code','shipping_country_code'
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
    public static function saveAccount($request, int $scopeCompanyId, ?int $linkedCompanyId = null){
        $a = new CrmAccount();

        // scope de multiempresa (empresa “dueña” de la cuenta CRM)
        $a->company_id = $scopeCompanyId;

        $name = AccountNameNormalizer::normalize($request->name);
        $tradename = AccountNameNormalizer::normalize($request->tradename);

        // enlace a maestro (solo si procede)
        //$a->linked_company_id = $request->boolean('auto_link') && $linkedCompanyId ? $linkedCompanyId : null;
        $a->linked_company_id = $linkedCompanyId;
        $a->name        = $name; // setNameAttribute también fija normalized_name
        $a->tradename   = $tradename !== '' ? $tradename : null;
        $a->owner_id    = Auth::id();
        $a->created_by  = Auth::id();
        $a->updated_by  = Auth::id();

        $a->save();

        return $a;
    }

    public function setNameAttribute($value): void
    {
        $name = is_string($value)
            ? AccountNameNormalizer::normalize($value)
            : $value;
        $this->attributes['name'] = $name;
        if (is_string($name)) {
            $this->attributes['normalized_name'] = SlugNormalizer::normalize($name);
        }
    }

    public function setTradenameAttribute($value): void
    {
        if ($value === null || (is_string($value) && $value === '')) {
            $this->attributes['tradename'] = null;

            return;
        }
        $this->attributes['tradename'] = is_string($value)
            ? AccountNameNormalizer::normalize($value)
            : $value;
    }

    public function setTaxIdAttribute($value): void
    {
        if ($value === null || (is_string($value) && $value === '')) {
            $this->attributes['tax_id'] = null;

            return;
        }
        $this->attributes['tax_id'] = is_string($value)
            ? NifNormalizer::normalize($value)
            : $value;
    }

    public function setNifAttribute($value): void
    {
        if ($value === null || (is_string($value) && $value === '')) {
            $this->attributes['nif'] = null;

            return;
        }
        $this->attributes['nif'] = is_string($value)
            ? NifNormalizer::normalize($value)
            : $value;
    }

    public function setMainEmailAttribute($value): void
    {
        if ($value === null || (is_string($value) && $value === '')) {
            $this->attributes['main_email'] = null;

            return;
        }
        $this->attributes['main_email'] = is_string($value)
            ? EmailNormalizer::normalize($value)
            : $value;
    }

    public function setMainPhoneAttribute($value): void
    {
        if ($value === null || (is_string($value) && $value === '')) {
            $this->attributes['main_phone'] = null;

            return;
        }
        if (! is_string($value)) {
            $this->attributes['main_phone'] = $value;

            return;
        }
        $e164 = PhoneNormalizer::toE164OrNull($value);
        $this->attributes['main_phone'] = $e164 ?? TextCleanupNormalizer::normalize($value);
    }

    public function setWebsiteAttribute($value): void
    {
        if ($value === null || (is_string($value) && $value === '')) {
            $this->attributes['website'] = null;

            return;
        }
        $this->attributes['website'] = is_string($value)
            ? TextCleanupNormalizer::normalize($value)
            : $value;
    }

    public function setBillingStreetAttribute($value): void
    {
        $this->attributes['billing_street'] = $this->normalizeOptionalText($value);
    }

    public function setBillingCityAttribute($value): void
    {
        $this->attributes['billing_city'] = $this->normalizeOptionalText($value);
    }

    public function setBillingStateAttribute($value): void
    {
        $this->attributes['billing_state'] = $this->normalizeOptionalText($value);
    }

    public function setBillingPostalCodeAttribute($value): void
    {
        $this->attributes['billing_postal_code'] = $this->normalizeOptionalText($value);
    }

    public function setBillingCountryCodeAttribute($value): void
    {
        $this->attributes['billing_country_code'] = $this->normalizeCountryCode($value);
    }

    public function setShippingStreetAttribute($value): void
    {
        $this->attributes['shipping_street'] = $this->normalizeOptionalText($value);
    }

    public function setShippingCityAttribute($value): void
    {
        $this->attributes['shipping_city'] = $this->normalizeOptionalText($value);
    }

    public function setShippingStateAttribute($value): void
    {
        $this->attributes['shipping_state'] = $this->normalizeOptionalText($value);
    }

    public function setShippingPostalCodeAttribute($value): void
    {
        $this->attributes['shipping_postal_code'] = $this->normalizeOptionalText($value);
    }

    public function setShippingCountryCodeAttribute($value): void
    {
        $this->attributes['shipping_country_code'] = $this->normalizeCountryCode($value);
    }

    private function normalizeOptionalText($value): ?string
    {
        if ($value === null || (is_string($value) && $value === '')) {
            return null;
        }
        if (! is_string($value)) {
            return $value;
        }
        $v = TextCleanupNormalizer::normalize($value);

        return $v === '' ? null : $v;
    }

    private function normalizeCountryCode($value): ?string
    {
        $v = $this->normalizeOptionalText($value);
        if ($v === null) {
            return null;
        }

        return mb_strtoupper($v, 'UTF-8');
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

    public function isLinkedToMaster(): bool
    {
        return !empty($this->linked_company_id);
    }


    public function isActive(): bool{
        return (int) $this->status === 1;
    }

    
}
