<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyEmail extends Model
{
    protected $table = 'company_emails';

    protected $fillable = [
        'company_id',
        'email',
        'featured',
        'observations',
    ];

    protected $casts = [
        'featured' => 'bool',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Scope para obtener sólo el email principal de la empresa.
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }
}
