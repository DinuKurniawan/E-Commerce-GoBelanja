<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\EmailCampaign;
use App\Services\EmailCampaignService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Carbon\Carbon;

class SendReEngagementEmailJob implements ShouldQueue
{
    use Queueable;

    public function handle(EmailCampaignService $campaignService): void
    {
        $campaign = EmailCampaign::firstOrCreate(
            [
                'type' => 're_engagement',
                'status' => 'draft',
                'name' => 'Automated Re-engagement - ' . now()->format('Y-m-d H:i'),
            ],
            [
                'subject' => 'We miss you! Come back and save 15%',
                'content' => 'It\'s been a while since we\'ve seen you. Here\'s a special offer just for you!',
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
