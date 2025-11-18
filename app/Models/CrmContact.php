<?php

namespace App\Models;

use App\Concerns\HasContactTypes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmContact extends Model
{
    use HasFactory, SoftDeletes, HasContactTypes;

    protected $table = 'crm_contacts';

    protected $fillable = [
        'company_id',
        'user_id',
        'crm_account_id',
        'contact_type',
        'owner_id',
        'is_main',
        'status',
        'observations',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'status'  => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function account()
    {
        return $this->belongsTo(CrmAccount::class, 'crm_account_id');
    }

    // Persona que es el contacto
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Responsable interno del contacto
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeMain($query)
    {
        return $query->where('is_main', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getContactTypeLabelAttribute(): ?string
    {
        $map = self::typesMap();

        return $this->contact_type && isset($map[$this->contact_type])
            ? $map[$this->contact_type]
            : null;
    }
}
