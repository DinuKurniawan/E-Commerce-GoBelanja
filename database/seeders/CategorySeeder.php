<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Elektronik', 'slug' => 'elektronik', 'icon' => '💻'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'icon' => '👕'],
            ['name' => 'Aksesoris', 'slug' => 'aksesoris', 'icon' => '⌚'],
            ['name' => 'Sepatu', 'slug' => 'sepatu', 'icon' => '👟'],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}
