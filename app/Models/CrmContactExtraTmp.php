<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Tabla temporal para importación de datos adicionales desde CSV Dynamics (contacts_all.csv).
 * @see config/crm_import.php contacts_extra
 */
class CrmContactExtraTmp extends Model
{
    protected $table = 'crm_contacts_extra_tmp';

    protected $fillable = [
        'email',
        'name',
        'surname',
        'cost_center',
        'department',
        'email2',
        'email3',
        'nif',
        'position',
        'phone1',
        'phone2',
        'phone3',
        'contact_type',
        'business_type',
    ];
}
