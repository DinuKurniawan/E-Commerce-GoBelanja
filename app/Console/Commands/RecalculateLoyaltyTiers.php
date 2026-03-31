<?php

namespace App\Console\Commands;

use App\Services\LoyaltyService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('loyalty:recalculate-tiers')]
#[Description('Recalculate user loyalty tiers')]
class RecalculateLoyaltyTiers extends Command
{
    public function __construct(private LoyaltyService $loyaltyService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Recalculating loyalty tiers...');
        
        $count = $this->loyaltyService->recalculateAllTiers();
        
        $this->info("Recalculated tiers for {$count} users.");
        
        return Command::SUCCESS;
    }
}
