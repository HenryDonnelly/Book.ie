<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PromoteUserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')
            ->where('email', 'N00220105@iadt.ie')
            ->update(['role_name' => 'admin']);
    }
}
