<?php

use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmAccountTmp;
use App\Models\CrmContactTmp;
use App\Models\User;

return [
    'meta' => [
        'system_user_id' => 1,
    ],
    'accounts' => [
        'file'       => storage_path('app/import/accounts.csv'),
        'model'      => CrmAccountTmp::class,
        // columna en la BD donde guardas el GUID original de Dynamics
        'external_id_column' => 'external_id',
        //'company_id' => 1, // la empresa del cliente en tu ERP

        'mapping' => [
            // CSV header          => columna BD
            'account_id'           => 'external_id',   // GUID original
            'account_name'         => 'account_name',
            'main_phone'           => 'main_phone',
            'city'                 => 'city',
            'main_contact'         => 'main_contact',
            'main_email'           => 'main_email',
            'second_email'         => 'second_email',
            'status'               => 'status',
            'nif'                  => 'nif',
            'primary_account'      => 'primary_account',
            'description'          => 'description',
            'address1'             => 'address1',
            'address1_street1'     => 'address1_street1',
            'address1_street2'     => 'address1_street2',
            'cp1'                  => 'cp1',
            'province1'            => 'province1',
            'country1'             => 'country1',
            'currency'             => 'currency',
            'created_date'         => 'created_date',
            'owner'                => 'owner'
        ],
    ],

    'contacts' => [
        'file'       => storage_path('app/import/contacts.csv'),
        'model'      => CrmContactTmp::class,
        'external_id_column' => 'external_id',

        'mapping' => [
            'contact_id'            => 'external_id',
            'email'                 => 'email',
            'company_name'          => 'company_name',
            'company_phone'         => 'company_phone',
            'status'                => 'status',
            'user_name'             => 'user_name',
            'surname'               => 'surname',
            'last_year_service'     => 'last_year_service',
            'cost_center'           => 'cost_center',
            'department'            => 'department',
            'description'           => 'description',
            'address1'              => 'address1',
            'address1_street1'      => 'address1_street1',
            'address1_street2'      => 'address1_street2',
            'address1_street3'      => 'address1_street3',
            'city1'                 => 'city1',
            'cp1'                   => 'cp1',
            'province1'             => 'province1',
            'country1'              => 'country1',
            'currency'              => 'currency',
            'created_date'          => 'created_date',
            'owner'                 => 'owner',
            'position'              => 'position',
            'responsable'           => 'responsable',
            'sex'                   => 'sex',
            'mobile'                => 'mobile',
            'phone_private1'        => 'phone_private1',
            'contact_type'          => 'contact_type'
        ],

        'account_relation' => null,

        // Cómo enganchar el contacto con la cuenta importada
        // 'account_relation' => [
        //     // campo del CSV que contiene el GUID de la cuenta
        //     'csv_account_guid_field' => '_parentcustomerid_value', 
        //     // modelo y columna BD donde guardaste ese GUID al importar cuentas
        //     'lookup_model'           => CrmAccount::class,
        //     'lookup_external_column' => 'external_id',
        //     // columna en la tabla de usuarios/contactos que apunta a crm_accounts
        //     'target_foreign_key'     => 'crm_account_id',
        // ],
    ],

];
