<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            ['name' => 'JNE Regular', 'cost' => 18000, 'tracking_url' => 'https://www.jne.co.id/tracking', 'is_active' => true],
            ['name' => 'SiCepat Best', 'cost' => 16000, 'tracking_url' => 'https://www.sicepat.com/checkAwb', 'is_active' => true],
            ['name' => 'J&T Express', 'cost' => 17000, 'tracking_url' => 'https://jet.co.id/track', 'is_active' => true],
        ];

        foreach ($methods as $method) {
            ShippingMethod::query()->updateOrCreate(
                ['name' => $method['name']],
                $method,
            );
        }
    }
}
