<?php

namespace App\Console\Commands;

use App\Services\LoyaltyService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('loyalty:expire-points')]
#[Description('Expire old loyalty points')]
class ExpireLoyaltyPoints extends Command
{
    public function __construct(private LoyaltyService $loyaltyService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Expiring old loyalty points...');
        
        $count = $this->loyaltyService->expirePoints();
        
        $this->info("Expired {$count} point records.");
        
        return Command::SUCCESS;
    }
}
