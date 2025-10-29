<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Support\Iban;
use App\Support\ToBool;

class BankAccount extends Model{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Guardar cuenta.
     */

    use SoftDeletes;

    protected $table = 'bank_accounts';

    protected $fillable = [
        'company_id',
        'accounting_account_id',
        'bank_id',
        'iban',
        'country_code',
        'entity',
        'office',
        'dc',
        'digits',
        'featured',
        'status',
        'featured_company_id',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'featured' => 'boolean',
        'status'   => 'boolean',
    ];

    // Si quieres exponer campos calculados
    protected $appends = [
        'iban_masked',
        'number_es',
    ];

    /**
     * 1. Creada por.
     */
    public function createdBy(){
       return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Actualizada por.
     */
    public function updatedBy(){
       return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * 3. Guardar cuenta.
     */
    public static function saveAccount(array $data, int $companyId): self{
        $country = strtoupper($data['country_code'] ?? '');
        $country = substr($country, 0, 2);

        // 1) Si viene IBAN, normaliza y valida
        if (!empty($data['iban'])) {
            $data['iban'] = Iban::normalize($data['iban']);
            // opcional: verifica mod-97; lanza si no cuadra
            if (! Iban::isValid($data['iban'])) {
                throw new \InvalidArgumentException('IBAN inválido');
            }

        // 2) Si NO viene IBAN y el país es ES, fusión de trozos españoles
        } elseif ($country === 'ES') {
            $iban = Iban::fromEsParts(
                $data['entity'] ?? null,
                $data['office'] ?? null,
                $data['dc'] ?? null,
                $data['digits'] ?? null
            );
            if (!$iban) {
                throw new \InvalidArgumentException('Faltan trozos de cuenta española');
            }
            $data['iban'] = $iban;

        // 3) Si NO viene IBAN y NO es ES: necesitas BBAN del país o rechaza
        } else {
            // si algún día guardas un 'bban' genérico, podrías hacer:
            // $data['iban'] = Iban::fromCountryAndBban($country, $data['bban']);
            throw new \InvalidArgumentException('Proporciona IBAN completo para países no ES');
        }

        return DB::transaction(function () use ($data, $companyId){
            $ac = new self();
            $ac->company_id            = $companyId;
            $ac->bank_id               = $data['bank_id'];
            $ac->accounting_account_id = $data['accounting_account_id'] ?? null;
            $ac->iban                  = $data['iban'];
            $ac->country_code          = $data['country_code'] ?? null;
            $ac->entity                = $data['entity'] ?? null;
            $ac->office                = $data['office'] ?? null;
            $ac->dc                    = $data['dc'] ?? null;
            $ac->digits                = $data['digits'] ?? null;
            $ac->featured              = ToBool::cast($data['featured'] ?? null, false);
            $ac->status                = ToBool::cast($data['status']   ?? null, false);
            $ac->created_by            = Auth::id();
            $ac->updated_by            = Auth::id();
            $ac->save();

            if($ac->featured){
                // Desmarca otras y deja esta como única principal
                $ac->markAsFeatured(); // ya hace el swap en transacción y refresca el modelo
            }

            // Si viene featured=true, puedes llamar a $acc->markAsFeatured();
            return $ac;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */
    public function company(){
        return $this->belongsTo(Company::class);
    }

    public function bank(){
        return $this->belongsTo(Bank::class);
    }

    public function accountingAccount(){
        return $this->belongsTo(AccountingAccount::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */
    public function scopeForCompany($query, $companyId){
        return $query->where('company_id', $companyId);
    }

    public function scopeForCurrentCompany($query){
        $companyId = session('company_id');
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        return $query;
    }

    public function scopeActive($query){
        return $query->where('status', true);
    }

    public function scopeFeatured($query){
        return $query->where('featured', true);
    }

    public function scopeSearch($query, $term){
        if (!$term) {
            return $query;
        }

        $term = trim($term);

        return $query->where(function ($q) use ($term) {
            $q->where('iban', 'like', "%{$term}%")
              ->orWhere('entity', 'like', "%{$term}%")
              ->orWhere('office', 'like', "%{$term}%")
              ->orWhere('digits', 'like', "%{$term}%");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Mutators / Accessors
    |--------------------------------------------------------------------------
    */

    public function setIbanAttribute($value){
        if (is_string($value)) {
            // Normaliza: quita espacios y mayúsculas
            $value = strtoupper(preg_replace('/\s+/', '', $value));
        }
        $this->attributes['iban'] = $value ?: null;
    }

    public function getIbanMaskedAttribute(){
        if (!$this->iban) {
            return null;
        }

        // Ej: ES12 **** **** **** **** 1234
        $iban = $this->iban;
        $len  = strlen($iban);

        if ($len <= 8) {
            return $iban;
        }

        $head = substr($iban, 0, 4);
        $tail = substr($iban, -4);
        $maskedMid = str_repeat('*', max(0, $len - 8));

        // Agrupa en bloques de 4 para visualización
        $pretty = $head . $maskedMid . $tail;
        return trim(implode(' ', str_split($pretty, 4)));
    }

    public function getNumberEsAttribute(){
        // Solo si tienes los trozos españoles completos
        if ($this->entity && $this->office && $this->dc && $this->digits) {
            return "{$this->entity}-{$this->office}-{$this->dc}-{$this->digits}";
        }
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Lógica de negocio
    |--------------------------------------------------------------------------
    */

    /**
     * Marca esta cuenta como principal de su empresa.
     * Hace un swap atómico: desmarca otras y marca esta.
     */
    public function markAsFeatured(){
        if (!$this->company_id) {
            // Si llegamos aquí sin empresa asociada, mejor fallar pronto.
            throw new \RuntimeException('No se puede marcar como principal sin company_id.');
        }

        DB::transaction(function () {
            // Desmarca otras featured de la misma empresa
            self::where('company_id', $this->company_id)
                ->where('id', '!=', $this->id)
                ->where('featured', true)
                ->update(['featured' => false]);

            // Marca esta
            $this->featured = true;
            $this->save();
        });

        // La restricción UNIQUE en la columna generada featured_company_id
        // actuará como red de seguridad en condiciones de carrera.
        return $this->refresh();
    }
}
