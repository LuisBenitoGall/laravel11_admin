<?php

use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmAccountTmp;
use App\Models\CrmContactTmp;
use App\Models\CrmMarketingCampaignsTmp;
use App\Models\CrmMarketingCampaignsExpressTmp;
use App\Models\CrmMarketingListTmp;
use App\Models\CrmPotentialCustomerTmp;
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
            'contact_id'                => 'external_id',
            'email'                     => 'email',
            'company_name'              => 'company_name',
            'normalized_company_name'   => 'normalized_company_name',
            'company_phone'             => 'company_phone',
            'status'                    => 'status',
            'user_name'                 => 'user_name',
            'surname'                   => 'surname',
            'last_year_service'         => 'last_year_service',
            'cost_center'               => 'cost_center',
            'department'                => 'department',
            'description'               => 'description',
            'address1'                  => 'address1',
            'address1_street1'          => 'address1_street1',
            'address1_street2'          => 'address1_street2',
            'address1_street3'          => 'address1_street3',
            'city1'                     => 'city1',
            'cp1'                       => 'cp1',
            'province1'                 => 'province1',
            'country1'                  => 'country1',
            'currency'                  => 'currency',
            'created_at'                => 'created_date',
            'owner'                     => 'owner',
            'position'                  => 'position',
            'responsable'               => 'responsable',
            'sex'                       => 'sex',
            'mobile'                    => 'mobile',
            'phone_private1'            => 'phone_private1',
            'contact_type'              => 'contact_type'
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

    'potential_customers' => [
        'file'       => storage_path('app/import/clientes_potenciales.csv'),
        'model'      => CrmPotentialCustomerTmp::class,
        'external_id_column' => 'external_id',

        'mapping' => [
            'contact_id'                => 'external_id',
            'name'                      => 'name',
            'surname'                   => 'surname',
            'email'                     => 'email',
            'created_date'              => 'created_date',
            'owner'                     => 'owner',
            'issue'                     => 'issue',
            'status_reason'             => 'status_reason',
            'cp'                        => 'cp',
            'description'               => 'description',
            'address'                   => 'address',
            'interest_level'            => 'interest_level'
        ]
    ],

    'marketing_lists' => [
        'file'       => storage_path('app/import/listas_marketing.csv'),
        'model'      => CrmMarketingListTmp::class,
        'external_id_column' => 'external_id',

        'mapping' => [
            'list_id'                => 'external_id',
            'list_name'                 => 'list_name',
            'type'                      => 'type',
            'tipo_integrante_lista'     => 'tipo_integrante_lista',
            'last_use'                  => 'last_use',
            'author'                    => 'author',
            'created_date'              => 'created_date',
            'num_members'               => 'num_members',
            'owner'                     => 'owner'
        ]
    ],

    'campaigns' => [
        'file'       => storage_path('app/import/campaigns.csv'),
        'model'      => CrmMarketingCampaignsTmp::class,
        'external_id_column' => 'external_id',

        'mapping' => [
            'campaign_id'               => 'external_id',
            'name'                      => 'name',
            'status_reason'             => 'status_reason',
            'created_date'              => 'created_date',
            'total_cost'                => 'total_cost',
            'campaign_code'             => 'campaign_code',
            'promote_code'              => 'promote_code',
            'description'               => 'description',
            'currency'                  => 'currency',
            'author'                    => 'author',
            'start_at'                  => 'start_at',
            'finish_at'                 => 'finish_at',
            'owner'                     => 'owner',
            'campaign_type'             => 'campaign_type',
            'cost_center'               => 'cost_center'            
        ]
    ],

    'campaigns_express' => [
        'file'       => storage_path('app/import/campaigns_express.csv'),
        'model'      => CrmMarketingCampaignsExpressTmp::class,
        'external_id_column' => 'external_id',

        'mapping' => [
            'ce_id'                     => 'external_id',
            'asunto'                    => 'name',
            'members_count'             => 'members_count',
            'send_ok'                   => 'send_ok',
            'send_ko'                   => 'send_ko',
            'status_reason'             => 'status_reason',
            'created_date'              => 'created_date',
            'owner'                     => 'owner',
            'action'                    => 'action',             
            'priority'                  => 'priority',  
            'members_type'              => 'members_type' ,
            'finish_at'                 => 'finish_at'
        ]
    ],

    'marketing_list_members' => [
        // Carpeta donde están TODOS los CSV de listas
        'dir' => storage_path('app/import/marketing_lists'),

        // Mapping global: cabecera CSV => campo lógico interno
        // Si alguna columna no existe en un fichero concreto: simplemente quedará a null.
        'mapping' => [
            'email'                     => 'email',
            'company'                   => 'company', 
            'company_phone'             => 'company_phone', 
            'status'                    => 'status', 
            'surname'                   => 'surname',
            'cost_center'               => 'cost_center',
            'address1'                  => 'address1',
            'street1'                   => 'street1',
            'street2'                   => 'street2',
            'street3'                   => 'street3',
            'province'                  => 'province',
            'city'                      => 'city',
            'country'                   => 'country',
            'cp'                        => 'cp',
            'nif'                       => 'nif',
            'created_date'              => 'created_date',
            'name'                      => 'name',
            'owner'                     => 'owner',
            'position'                  => 'position',
            'department'                => 'department',
            'sex'                       => 'sex',
            'mobile'                    => 'mobile',
            'private_phone1'            => 'private_phone1',
            'birthday'                  => 'birthday'
        ]
    ]

];
