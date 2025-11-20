<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

//Concerns:
use App\Concerns\HasRelevanceLevels;

class UserNote extends Model{
    use HasFactory, SoftDeletes, HasRelevanceLevels;

    protected $table = 'user_notes';

    protected $fillable = [
        'company_id',
        'owner_id',
        'contact_id',
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
        return $this->belongsTo(Company::class);
    }

    public function owner(){
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function contact(){
        return $this->belongsTo(User::class, 'contact_id');
    }

    // Scopes de cortesía
    public function scopeForCompany($query, int $companyId){
        return $query->where('company_id', $companyId);
    }

    public function scopeForContact($query, int $contactId){
        return $query->where('contact_id', $contactId);
    }
}
