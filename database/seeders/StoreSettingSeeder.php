<?php

namespace Database\Seeders;

use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class StoreSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StoreSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'store_name' => 'GoBelanja',
                'store_logo' => null,
                'payment_method' => 'Midtrans (Online Payment), Transfer Bank, E-Wallet, COD',
                'api_key' => null,
            ],
        );
    }
}
