<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// Concerns:
use App\Concerns\HasRelevanceLevels;

class CompanyNote extends Model{
    use HasFactory, SoftDeletes, HasRelevanceLevels;

    protected $table = 'company_notes';

    protected $fillable = [
        'company_id',           // tenant / empresa a la que pertenece la nota
        'owner_id',             // usuario que escribe la nota
        'subject_company_id',   // empresa sobre la que trata la nota
        'title',
        'body',
        'tags',
        'relevance',
        'remind_at',
        'reminder_sent_at',
        'is_pinned',
        'is_archived',
    ];

    protected $casts = [
        'tags'              => 'array',
        'relevance'         => 'integer',
        'remind_at'         => 'datetime',
        'reminder_sent_at'  => 'datetime',
        'is_pinned'         => 'boolean',
        'is_archived'       => 'boolean',
    ];

    public const RELEVANCE_MIN = 1;
    public const RELEVANCE_MAX = 5;

    // Relaciones
    public function company(){
        // Empresa "propietaria" de la nota (tenant)
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function owner(){
        // Usuario que escribe la nota
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function subjectCompany(){
        // Empresa sobre la que trata la nota
        return $this->belongsTo(Company::class, 'subject_company_id');
    }

    // Scopes de cortesía
    public function scopeForCompany($query, int $companyId){
        return $query->where('company_id', $companyId);
    }

    public function scopeForSubjectCompany($query, int $subjectCompanyId){
        return $query->where('subject_company_id', $subjectCompanyId);
    }

    public function scopeForOwner($query, int $ownerId){
        return $query->where('owner_id', $ownerId);
    }
}
