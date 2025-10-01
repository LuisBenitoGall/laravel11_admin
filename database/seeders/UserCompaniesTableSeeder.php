<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//Models:
use App\Models\Account;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\CompanyAccount;
use App\Models\User;
use App\Models\UserCompany;
use App\Models\Workplace;

class UserCompaniesTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(){
        //Creamos empresa piloto:
    	$data = [
            'mother_co' => 1,
    		'name' => 'ACME',
    		'slug' => 'acme',
    		'nif' => '00000000A',
            'created_by' => 1,
            'updated_by' => 1
    	];
        $company = Company::create($data);

        //Configuraciones de empresa:
        $data_settings = [
            'company_id' => $company->id
        ];
        CompanySetting::create($data_settings);

        //Creamos cuenta de la empresa:
        $account = Account::first();
        $data = [
            'company_id' => $company->id,
            'guardian' => $company->id,
            'account_id' => $account->id,
            'start_date' => date('Y-m-d'),
            'end_date' => config('constants.UNDEFINED_DATE_')
        ];
        CompanyAccount::create($data);

        //Creamos centro de trabajo principal de la empresa:
        $data = [
            'name' => 'ACME Headquarters',
            'slug' => 'acme-headquarters',
            'company_id' => $company->id,
            'featured' => true
        ];
        Workplace::create($data);

        //Obtenemos el usuario generado:
        $user = User::orderBy('id', 'ASC')->first();

        //Vínculo usuario - empresa:
        $data = [
        	'user_id' => $user->id, 
        	'company_id' => $company->id
    	];
        UserCompany::create($data);
    }
}
