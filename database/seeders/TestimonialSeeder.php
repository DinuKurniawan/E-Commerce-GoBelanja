<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['name' => 'Rani', 'rating' => 5, 'comment' => 'Pengiriman cepat, barang original. Recommended!', 'is_active' => true],
            ['name' => 'Dimas', 'rating' => 5, 'comment' => 'UI toko keren, belanja jadi gampang banget.', 'is_active' => true],
            ['name' => 'Sinta', 'rating' => 4, 'comment' => 'Promo menarik, kualitas produk bagus.', 'is_active' => true],
        ];

        foreach ($items as $item) {
            Testimonial::query()->updateOrCreate(
                ['name' => $item['name']],
                $item,
            );
        }
    }
}
