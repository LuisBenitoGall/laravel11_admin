<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Tabla temporal para importación de last_year_service desde CSV (contacts_year_service.csv).
 *
 * @see config/crm_import.php contacts_year_service
 */
class CrmContactYearServiceTmp extends Model
{
    protected $table = 'crm_contacts_year_service_tmp';

    protected $fillable = [
        'name',
        'surname',
        'email',
        'service_last_year',
    ];

    protected $casts = [
        'service_last_year' => 'integer',
    ];
}
