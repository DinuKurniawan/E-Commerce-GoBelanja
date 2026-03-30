<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->updateOrCreate([
            'email' => 'admin@gobelanja.test',
        ], [
            'name' => 'Admin GoBelanja',
            'role' => 'admin',
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);

        User::query()->updateOrCreate([
            'email' => 'user@gobelanja.test',
        ], [
            'name' => 'User GoBelanja',
            'role' => 'user',
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);
    }
}
