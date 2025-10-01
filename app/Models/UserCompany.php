<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserCompany extends Model{
    /**
     * 1. Session de empresas vinculadas al usuario.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'user_companies';

    protected $fillable = ['user_id', 'company_id', 'position'];

    // Relaciones útiles
    public function user()    { return $this->belongsTo(User::class); }
    public function company() { return $this->belongsTo(Company::class); }

    /**
     * 1. Session de empresas vinculadas al usuario.
     * Mantiene en sesión las empresas activas del usuario.
     * Sugerencia: esto acabaría mejor en un servicio, pero no te lo voy a secuestrar ahora.
     */
    public static function userCompanies(){
        $companies = auth()->user()->companies();

        \Session::forget('companies');
        foreach ($companies as $row) {
            if ($row->status) {
                \Session::push('companies', $row);
            }
        }
        return $companies;
    }
}
