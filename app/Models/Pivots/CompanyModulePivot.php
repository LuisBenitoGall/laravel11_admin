<?php

namespace App\Models\Pivots;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyModulePivot extends Pivot{
    use SoftDeletes;

    protected $table = 'company_modules';
    public $timestamps = true;

    // Nuestra tabla tiene id autoincremental
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['company_id','module_id','deleted_at','created_at','updated_at'];
}
