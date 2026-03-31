<?php

namespace App\Http\Controllers;

use App\Services\FlashSaleService;
use Inertia\Inertia;
use Inertia\Response;

class FlashSaleController extends Controller
{
    public function __construct(
        private FlashSaleService $flashSaleService
    ) {}

    public function index(): Response
    {
        $flashSales = $this->flashSaleService->getActiveFlashSales()
            ->map(function ($flashSale) {
                return [
                    'id' => $flashSale->id,
                    'name' => $flashSale->name,
                    'product' => $flashSale->product,
                    'discount_percent' => $flashSale->discount_percent,
                    'flash_price' => $flashSale->flash_price,
                    'max_quantity' => $flashSale->max_quantity,
                    'sold_quantity' => $flashSale->sold_quantity,
                    'remaining_quantity' => $flashSale->remaining_quantity,
                    'progress_percent' => $flashSale->progress_percent,
                    'starts_at' => $flashSale->starts_at->toISOString(),
                    'ends_at' => $flashSale->ends_at->toISOString(),
                ];
            });

        return Inertia::render('FlashSales', [
            'flashSales' => $flashSales,
        ]);
    }
}
