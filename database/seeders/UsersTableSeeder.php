<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

//Models:
use App\Models\User;

class UsersTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(){
        //Default Admin:
        $data = [
            'name' => 'Admin', 
            'surname' => 'Default', 
            'email' => 'admin@default.com', 
            'password' => bcrypt('12345678'),
            'nickname' => 'superadmin',
            'isAdmin' => 1,
            'status' => 1,
            'remember_token' => Str::random(10)
        ];
        User::create($data)->assignRole('Super Admin');
    }
}
