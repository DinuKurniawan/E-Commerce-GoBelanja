<?php

namespace App\Console\Commands;

use App\Services\LoyaltyService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('loyalty:birthday-bonuses')]
#[Description('Process birthday bonuses for users')]
class ProcessBirthdayBonuses extends Command
{
    public function __construct(private LoyaltyService $loyaltyService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Processing birthday bonuses...');
        
        $count = $this->loyaltyService->processBirthdayBonuses();
        
        $this->info("Awarded birthday bonuses to {$count} users.");
        
        return Command::SUCCESS;
    }
}
