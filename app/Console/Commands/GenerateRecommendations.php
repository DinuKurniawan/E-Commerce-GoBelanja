<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\RecommendationService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('recommendations:generate {product_id? : The ID of the product to generate recommendations for}')]
#[Description('Generate product recommendations for all products or a specific product')]
class GenerateRecommendations extends Command
{
    public function __construct(
        private RecommendationService $recommendationService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $productId = $this->argument('product_id');

        if ($productId) {
            $product = Product::find($productId);
            
            if (!$product) {
                $this->error("Product with ID {$productId} not found.");
                return self::FAILURE;
            }

            $this->info("Generating recommendations for product: {$product->name}");
            
            $this->recommendationService->calculateRecommendations($productId);
            
            $this->info('Recommendations generated successfully!');
            
            return self::SUCCESS;
        }

        // Generate for all products
        $this->info('Generating recommendations for all products...');
        
        $products = Product::where('is_available', true)->get();
        $total = $products->count();
        
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($products as $product) {
            $this->recommendationService->calculateRecommendations($product->id);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        
        $this->info("Recommendations generated for {$total} products successfully!");
        
        return self::SUCCESS;
    }
}
