<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Belanja Hemat Setiap Hari',
                'subtitle' => 'Promo terbaik, produk favorit, checkout cepat di GoBelanja',
                'image' => 'images/banners/default-1.svg',
                'link' => '/',
                'target_blank' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Flash Sale & Diskon Besar',
                'subtitle' => 'Temukan penawaran spesial dan hemat hingga 70%',
                'image' => 'images/banners/default-2.svg',
                'link' => '/products/search?flash_sale=1',
                'target_blank' => false,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Gratis Ongkir & Pengiriman Cepat',
                'subtitle' => 'Nikmati pengalaman belanja modern ke seluruh Indonesia',
                'image' => 'images/banners/default-3.svg',
                'link' => '/register',
                'target_blank' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::query()->firstOrCreate(
                ['title' => $banner['title']],
                $banner,
            );
        }
    }
}
