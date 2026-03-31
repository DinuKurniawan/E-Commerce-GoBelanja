<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\CartItem;
use App\Models\EmailCampaign;
use App\Services\EmailCampaignService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SendAbandonedCartEmailJob implements ShouldQueue
{
    use Queueable;

    public function handle(EmailCampaignService $campaignService): void
    {
        $campaign = EmailCampaign::firstOrCreate(
            [
                'type' => 'abandoned_cart',
                'status' => 'draft',
                'name' => 'Automated Abandoned Cart - ' . now()->format('Y-m-d H:i'),
            ],
            [
                'subject' => 'You left something in your cart!',
                'content' => 'Complete your purchase and get 10% off!',
            ]
        );

        $recipients = $campaignService->getRecipients($campaign);

        if (count($recipients) > 0) {
            $campaign->update([
                'status' => 'sending',
                'recipients_count' => count($recipients),
            ]);

            foreach ($recipients as $recipient) {
                SendEmailCampaignJob::dispatch($campaign, $recipient);
            }
        }
    }
}
