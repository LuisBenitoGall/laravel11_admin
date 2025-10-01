<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//Models:
use App\Models\Account;

class AccountsTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(){
        $data = [
        	['name' => 'free',
        	'slug' => 'free']
        ];

        foreach($data as $value){
            Account::create($value);
        }
    }
}
