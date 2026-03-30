<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Seeder;

class UserNotificationSeeder extends Seeder
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

        $notifications = [
            [
                'user_id' => $user->id,
                'type' => 'order',
                'title' => 'Pesanan Anda sedang diproses',
                'message' => 'Order INV-GB-1002 sedang dipersiapkan oleh tim kami.',
                'is_read' => false,
            ],
            [
                'user_id' => $user->id,
                'type' => 'promo',
                'title' => 'Promo Spesial Weekend',
                'message' => 'Gunakan kode NEWUSER10 untuk diskon hingga 10%.',
                'is_read' => false,
            ],
            [
                'user_id' => $user->id,
                'type' => 'system',
                'title' => 'Profil berhasil diperbarui',
                'message' => 'Data profil akun GoBelanja Anda sudah kami simpan.',
                'is_read' => true,
            ],
        ];

        foreach ($notifications as $notification) {
            UserNotification::query()->updateOrCreate(
                [
                    'user_id' => $notification['user_id'],
                    'title' => $notification['title'],
                ],
                $notification,
            );
        }
    }
}
