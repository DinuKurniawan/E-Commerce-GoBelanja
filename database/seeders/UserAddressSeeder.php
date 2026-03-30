<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;

class UserAddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'user@gobelanja.test')->first();

        if (! $user) {
            return;
        }

        $addresses = [
            [
                'user_id' => $user->id,
                'label' => 'Rumah',
                'recipient_name' => $user->name,
                'phone' => '081234567890',
                'full_address' => 'Jl. Merdeka No. 10, Bandung, Jawa Barat',
                'is_default' => true,
            ],
            [
                'user_id' => $user->id,
                'label' => 'Kantor',
                'recipient_name' => $user->name,
                'phone' => '081234567891',
                'full_address' => 'Jl. Sudirman No. 88, Jakarta Pusat',
                'is_default' => false,
            ],
        ];

        foreach ($addresses as $address) {
            UserAddress::query()->updateOrCreate(
                [
                    'user_id' => $address['user_id'],
                    'label' => $address['label'],
                ],
                $address,
            );
        }
    }
}
