<?php

namespace App\Services;

use App\Models\EmailCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use App\Models\Order;
use App\Models\CartItem;
use App\Models\EmailCampaignTracking;
use App\Jobs\SendEmailCampaignJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EmailCampaignService
{
    public function getRecipients(EmailCampaign $campaign): array
    {
        $filter = $campaign->recipient_filter ?? [];
        $recipients = [];

        switch ($campaign->type) {
            case 'newsletter':
                $recipients = $this->getNewsletterRecipients($filter);
                break;
            case 'promotion':
                $recipients = $this->getPromotionRecipients($filter);
                break;
            case 'abandoned_cart':
                $recipients = $this->getAbandonedCartRecipients();
                break;
            case 'product_recommendation':
                $recipients = $this->getProductRecommendationRecipients($filter);
                break;
            case 're_engagement':
                $recipients = $this->getReEngagementRecipients();
                break;
            default:
                $recipients = $this->getAllSubscribers();
        }

        return $recipients;
    }

    protected function getNewsletterRecipients(array $filter): array
    {
        $query = NewsletterSubscriber::active()->subscribed()->verified();

        return $query->get()->map(function ($subscriber) {
            return [
                'email' => $subscriber->email,
                'name' => $subscriber->name ?? 'Subscriber',
                'user_id' => null,
            ];
        })->toArray();
    }

    protected function getPromotionRecipients(array $filter): array
    {
        $query = User::whereNotNull('email');

        if (isset($filter['purchased_days'])) {
            $query->whereHas('orders', function ($q) use ($filter) {
                $q->where('created_at', '>=', Carbon::now()->subDays($filter['purchased_days']));
            });
        }

        if (isset($filter['spent_amount'])) {
            $query->whereHas('orders', function ($q) use ($filter) {
                $q->havingRaw('SUM(total_amount) > ?', [$filter['spent_amount']]);
            });
        }

        if (isset($filter['loyalty_tier']) && !empty($filter['loyalty_tier'])) {
            $query->whereHas('loyaltyTier', function ($q) use ($filter) {
                $q->where('tier_name', $filter['loyalty_tier']);
            });
        }

        if (isset($filter['never_purchased']) && $filter['never_purchased']) {
            $query->doesntHave('orders');
        }

        return $query->get()->map(function ($user) {
            return [
                'email' => $user->email,
                'name' => $user->name,
                'user_id' => $user->id,
                'loyalty_tier' => $user->loyaltyTier->tier_name ?? 'Bronze',
                'points' => $user->loyaltyPoints->sum('points') ?? 0,
            ];
        })->toArray();
    }

    protected function getAbandonedCartRecipients(): array
    {
        $cutoffTime = Carbon::now()->subHours(24);

        $userIds = CartItem::select('user_id')
            ->where('created_at', '<=', $cutoffTime)
            ->whereHas('user', function ($q) {
                $q->whereNotNull('email');
            })
            ->whereNotExists(function ($query) use ($cutoffTime) {
                $query->select(DB::raw(1))
                    ->from('orders')
                    ->whereColumn('orders.user_id', 'cart_items.user_id')
                    ->where('orders.created_at', '>', $cutoffTime);
            })
            ->groupBy('user_id')
            ->pluck('user_id');

        return User::whereIn('id', $userIds)->get()->map(function ($user) {
            $cartItems = $user->cartItems()->with('product')->get();
            return [
                'email' => $user->email,
                'name' => $user->name,
                'user_id' => $user->id,
                'cart_items' => $cartItems->map(function ($item) {
                    return [
                        'product_name' => $item->product->name,
                        'product_image' => $item->product->images->first()?->image_path ?? '',
                        'product_price' => $item->product->price,
                        'quantity' => $item->quantity,
                    ];
                })->toArray(),
                'cart_total' => $cartItems->sum(fn($item) => $item->product->price * $item->quantity),
            ];
        })->toArray();
    }

    protected function getProductRecommendationRecipients(array $filter): array
    {
        return User::whereNotNull('email')
            ->whereHas('orders')
            ->get()
            ->map(function ($user) {
                return [
                    'email' => $user->email,
                    'name' => $user->name,
                    'user_id' => $user->id,
                ];
            })->toArray();
    }

    protected function getReEngagementRecipients(): array
    {
        $cutoffDate = Carbon::now()->subDays(30);

        return User::whereNotNull('email')
            ->where(function ($query) use ($cutoffDate) {
                $query->doesntHave('orders')
                    ->orWhereDoesntHave('orders', function ($q) use ($cutoffDate) {
                        $q->where('created_at', '>', $cutoffDate);
                    });
            })
            ->where('last_login_at', '<', $cutoffDate)
            ->get()
            ->map(function ($user) {
                return [
                    'email' => $user->email,
                    'name' => $user->name,
                    'user_id' => $user->id,
                ];
            })->toArray();
    }

    protected function getAllSubscribers(): array
    {
        return NewsletterSubscriber::active()->subscribed()->get()->map(function ($subscriber) {
            return [
                'email' => $subscriber->email,
                'name' => $subscriber->name ?? 'Subscriber',
                'user_id' => null,
            ];
        })->toArray();
    }

    public function sendCampaign(EmailCampaign $campaign): void
    {
        $recipients = $this->getRecipients($campaign);
        
        $campaign->update([
            'status' => 'sending',
            'recipients_count' => count($recipients),
        ]);

        foreach ($recipients as $recipient) {
            SendEmailCampaignJob::dispatch($campaign, $recipient);
        }
    }

    public function trackOpen(int $campaignId, string $email): void
    {
        $campaign = EmailCampaign::find($campaignId);
        if (!$campaign) return;

        $existing = EmailCampaignTracking::where('email_campaign_id', $campaignId)
            ->where('email', $email)
            ->where('event_type', 'opened')
            ->first();

        if (!$existing) {
            EmailCampaignTracking::create([
                'email_campaign_id' => $campaignId,
                'email' => $email,
                'event_type' => 'opened',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $campaign->increment('opened_count');
        }
    }

    public function trackClick(int $campaignId, string $email, string $url): void
    {
        $campaign = EmailCampaign::find($campaignId);
        if (!$campaign) return;

        EmailCampaignTracking::create([
            'email_campaign_id' => $campaignId,
            'email' => $email,
            'event_type' => 'clicked',
            'link_url' => $url,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $campaign->increment('clicked_count');
    }

    public function generateUnsubscribeToken(string $email): string
    {
        $token = Str::random(64);
        
        $subscriber = NewsletterSubscriber::where('email', $email)->first();
        if ($subscriber) {
            $subscriber->update(['unsubscribe_token' => $token]);
        }

        return $token;
    }

    public function processVariables(string $content, array $data): string
    {
        $variables = [
            '{name}' => $data['name'] ?? 'Customer',
            '{email}' => $data['email'] ?? '',
            '{loyalty_tier}' => $data['loyalty_tier'] ?? 'Bronze',
            '{points}' => $data['points'] ?? 0,
        ];

        return str_replace(array_keys($variables), array_values($variables), $content);
    }
}
