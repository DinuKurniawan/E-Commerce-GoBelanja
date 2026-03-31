<?php

namespace App\Jobs;

use App\Models\EmailCampaign;
use App\Models\EmailCampaignTracking;
use App\Services\EmailCampaignService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendEmailCampaignJob implements ShouldQueue
{
    use Queueable;

    protected EmailCampaign $campaign;
    protected array $recipient;

    public function __construct(EmailCampaign $campaign, array $recipient)
    {
        $this->campaign = $campaign;
        $this->recipient = $recipient;
    }

    public function handle(EmailCampaignService $campaignService): void
    {
        try {
            $content = $campaignService->processVariables(
                $this->campaign->content,
                $this->recipient
            );

            $trackingEmail = base64_encode($this->recipient['email']);
            $trackingPixelUrl = route('email.track.open', [
                'campaign' => $this->campaign->id,
                'email' => $trackingEmail,
            ]);

            $unsubscribeToken = $campaignService->generateUnsubscribeToken($this->recipient['email']);
            $unsubscribeUrl = route('newsletter.unsubscribe', ['token' => $unsubscribeToken]);

            Mail::send(
                'emails.campaigns.' . $this->campaign->type,
                [
                    'campaign' => $this->campaign,
                    'recipient' => $this->recipient,
                    'content' => $content,
                    'tracking_pixel_url' => $trackingPixelUrl,
                    'unsubscribe_url' => $unsubscribeUrl,
                    'tracking_email' => $trackingEmail,
                    'campaign_id' => $this->campaign->id,
                ],
                function ($message) {
                    $message->to($this->recipient['email'], $this->recipient['name'])
                        ->subject($this->campaign->subject);
                }
            );

            EmailCampaignTracking::create([
                'email_campaign_id' => $this->campaign->id,
                'email' => $this->recipient['email'],
                'user_id' => $this->recipient['user_id'] ?? null,
                'event_type' => 'sent',
            ]);

            if ($this->campaign->status === 'sending') {
                $sentCount = EmailCampaignTracking::where('email_campaign_id', $this->campaign->id)
                    ->where('event_type', 'sent')
                    ->count();

                if ($sentCount >= $this->campaign->recipients_count) {
                    $this->campaign->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to send email campaign', [
                'campaign_id' => $this->campaign->id,
                'recipient' => $this->recipient['email'],
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
