<?php

namespace App\Console\Commands;

use App\Services\FlashSaleService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('flashsales:deactivate-expired')]
#[Description('Deactivate expired flash sales')]
class DeactivateExpiredFlashSales extends Command
{
    public function __construct(
        private FlashSaleService $flashSaleService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $count = $this->flashSaleService->deactivateExpiredFlashSales();

        if ($count > 0) {
            $this->info("Deactivated {$count} expired flash sale(s).");
        }

        return self::SUCCESS;
    }
}

