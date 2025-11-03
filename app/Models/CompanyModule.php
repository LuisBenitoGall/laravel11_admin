<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyModule extends Model{
    /**
     * 1. Módulos por empresa. 
     */
    
    use HasFactory;
    use SoftDeletes;

    protected $table = 'company_modules';

    protected $fillable = ['company_id', 'module_id']; 

    /**
     * 1. Módulos por empresa.
     */
    public static function getCompanyModules($id){
        return CompanyModule::where('company_modules.company_id', $id)
        ->join('modules', 'company_modules.module_id', '=', 'modules.id')
        ->pluck('modules.slug')
        ->toArray();
    } 
}
