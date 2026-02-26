<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentVariant extends Model
{
    use HasFactory;

    protected $table = 'document_variants';

    protected $fillable = [
        'company_id',
        'document_id',
        'variant',
        'disk',
        'path',
        'mime_type',
        'size_bytes',
        'width',
        'height',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public const THUMB_SM = 'thumb_sm';
    public const THUMB_MD = 'thumb_md';
    public const PREVIEW = 'preview';

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
