<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule flash sale deactivation every minute
Schedule::command('flashsales:deactivate-expired')->everyMinute();

// Schedule email notifications
Schedule::command('email:send-review-reminders')->daily();
Schedule::command('email:send-abandoned-cart')->daily();

// Schedule daily low stock check at 9 AM
Schedule::job(new \App\Jobs\DailyLowStockCheckJob)->dailyAt('09:00');

// Email Campaign Scheduling
use App\Models\EmailCampaign;
use App\Services\EmailCampaignService;
use App\Jobs\SendAbandonedCartEmailJob;
use App\Jobs\SendReEngagementEmailJob;

Schedule::call(function () {
    $campaigns = EmailCampaign::where('status', 'scheduled')
        ->where('scheduled_at', '<=', now())
        ->get();

    foreach ($campaigns as $campaign) {
        $campaignService = app(EmailCampaignService::class);
        $campaignService->sendCampaign($campaign);
    }
})->hourly()->name('send-scheduled-campaigns');

Schedule::job(new SendAbandonedCartEmailJob)->everyFourHours()->name('send-abandoned-cart-emails');

Schedule::job(new SendReEngagementEmailJob)->daily()->name('send-reengagement-emails');

// Loyalty Program Schedules
Schedule::command('loyalty:expire-points')->daily();
Schedule::command('loyalty:birthday-bonuses')->daily();
Schedule::command('loyalty:recalculate-tiers')->weekly();

// Product Recommendations
Schedule::command('recommendations:generate')->daily()->at('02:00')->name('generate-recommendations');

