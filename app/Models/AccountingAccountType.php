<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountingAccountType extends Model{
    /**
     * 
     */
    use HasFactory;

    protected $table = 'accounting_account_types';

    protected $fillable = ['autoreference', 'code', 'name', 'mode'];

    // Normalizadores mínimos
    public function setCodeAttribute($v): void {
        // Trim y sin espacios internos accidentales; no toco dígitos/guiones si los usas
        $this->attributes['code'] = preg_replace('/\s+/', '', (string) $v);
    }

    public function setAutoreferenceAttribute($v): void {
        if ($v === null || $v === '') {
            $this->attributes['autoreference'] = '0';   // raíz por defecto
            return;
        }
        // Deja solo dígitos; si queda vacío, a '0'
        $onlyDigits = preg_replace('/\D+/', '', (string) $v);
        $this->attributes['autoreference'] = $onlyDigits === '' ? '0' : $onlyDigits;
    }

    // Scopes útiles para jerarquía
    public function scopeRoot($q){ return $q->where('autoreference', '0'); }
    public function scopeChildrenOf($q, int|string $parentId){
        return $q->where('autoreference', (string) $parentId);
    }
}
