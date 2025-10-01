<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyAccount extends Model{
    /**
     * 1. Tipo de cuenta.
     */

    use HasFactory, SoftDeletes;

    protected $table = 'company_accounts';

    protected $fillable = [
        'company_id','guardian','account_id',
        'start_date','end_date','price','payment_date','status'
    ];

    protected function casts(): array {
        return [
            'start_date'  => 'date',
            'end_date'    => 'date',
            'payment_date'=> 'date',
            'price'       => 'decimal:2',
            'status'      => 'integer',
        ];
    }

    // Relaciones
    public function company()        { return $this->belongsTo(Company::class, 'company_id'); }
    public function guardianCompany(){ return $this->belongsTo(Company::class, 'guardian'); }
    public function account()        { return $this->belongsTo(Account::class, 'account_id'); }

    /**
     * 1. Tipo de cuenta.
     */
    public function accountType(){
        // Alias legible si quieres seguir llamando account() desde fuera
        return $this->account();
    }

    // Scopes útiles
    public function scopeForCompany($q, int $companyId){
        return $q->where('company_id', $companyId);
    }

    public function scopeActive($q){
        return $q->where('status', 1);
    }

    public function scopeCurrentAt($q, $date = null){
        $d = $date ? \Illuminate\Support\Carbon::parse($date) : now()->toDateString();
        return $q->where(function($q) use ($d){
                $q->whereNull('start_date')->orWhere('start_date', '<=', $d);
            })
            ->where(function($q) use ($d){
                $q->whereNull('end_date')->orWhere('end_date', '>=', $d);
            });
    }

    // Helper: cuenta vigente hoy para una empresa (si existiera más de una, devuelve la más reciente)
    public static function currentForCompany(int $companyId): ?self
    {
        return static::forCompany($companyId)
            ->active()
            ->currentAt()
            ->latest('start_date')
            ->first();
    }
}
