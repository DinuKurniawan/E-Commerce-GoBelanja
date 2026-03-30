<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Essential structural data only — no fake orders/transactions.
        $this->call([
            UserSeeder::class,          // Admin + user account for login
            CategorySeeder::class,      // Product categories
            StoreSettingSeeder::class,  // Store name, payment methods
            ShippingMethodSeeder::class, // Courier options for checkout
        ]);
    }
}
