<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $categories = Schema::hasTable('categories')
            ? Category::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'icon'])
            : collect();

        $products = Schema::hasTable('products')
            ? Product::query()
                ->with(['category:id,name,slug', 'images', 'sizes'])
                ->latest()
                ->get([
                    'id',
                    'category_id',
                    'name',
                    'slug',
                    'price',
                    'stock',
                    'weight',
                    'rating',
                    'is_new',
                    'is_featured',
                    'is_popular',
                    'emoji',
                    'image_url',
                ])
            : collect();

        $testimonials = Schema::hasTable('testimonials')
            ? Testimonial::query()
                ->where('is_active', true)
                ->latest()
                ->get(['id', 'name', 'rating', 'comment'])
            : collect();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'appName' => config('app.name'),
            'categories' => $categories,
            'products' => $products,
            'testimonials' => $testimonials,
        ]);
    }
}
