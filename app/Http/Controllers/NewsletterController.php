<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use App\Services\EmailCampaignService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    protected EmailCampaignService $campaignService;

    public function __construct(EmailCampaignService $campaignService)
    {
        $this->campaignService = $campaignService;
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:newsletter_subscribers,email',
            'name' => 'nullable|string|max:255',
        ]);

        $token = Str::random(64);
        $unsubscribeToken = Str::random(64);

        $subscriber = NewsletterSubscriber::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'verification_token' => $token,
            'unsubscribe_token' => $unsubscribeToken,
            'is_active' => true,
            'status' => 'subscribed',
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Thank you for subscribing to our newsletter!',
            'subscriber' => [
                'email' => $subscriber->email,
                'name' => $subscriber->name,
            ],
        ], 201);
    }

    public function unsubscribe($token): Response|RedirectResponse
    {
        $subscriber = NewsletterSubscriber::where('unsubscribe_token', $token)->first();

        if (!$subscriber) {
            return Inertia::render('Newsletter/UnsubscribeError');
        }

        if (request()->isMethod('post')) {
            $subscriber->update([
                'is_active' => false,
                'status' => 'unsubscribed',
                'unsubscribed_at' => now(),
            ]);

            $reason = request()->input('reason');
            
            return Inertia::render('Newsletter/UnsubscribeSuccess', [
                'email' => $subscriber->email,
            ]);
        }

        return Inertia::render('Newsletter/Unsubscribe', [
            'email' => $subscriber->email,
            'token' => $token,
        ]);
    }

    public function preferences($token): Response
    {
        $subscriber = NewsletterSubscriber::where('unsubscribe_token', $token)
            ->orWhere('verification_token', $token)
            ->first();

        if (!$subscriber) {
            return Inertia::render('Newsletter/PreferencesError');
        }

        if (request()->isMethod('post')) {
            $preferences = request()->validate([
                'receive_promotions' => 'boolean',
                'receive_newsletters' => 'boolean',
                'receive_product_updates' => 'boolean',
            ]);

            $subscriber->update([
                'preferences' => $preferences,
            ]);

            return Inertia::render('Newsletter/PreferencesSuccess');
        }

        return Inertia::render('Newsletter/Preferences', [
            'subscriber' => [
                'email' => $subscriber->email,
                'name' => $subscriber->name,
                'preferences' => $subscriber->preferences ?? [
                    'receive_promotions' => true,
                    'receive_newsletters' => true,
                    'receive_product_updates' => true,
                ],
            ],
            'token' => $token,
        ]);
    }

    public function resubscribe($token): RedirectResponse
    {
        $subscriber = NewsletterSubscriber::where('unsubscribe_token', $token)->first();

        if (!$subscriber) {
            return redirect()->route('home')->with('error', 'Invalid token');
        }

        $subscriber->update([
            'is_active' => true,
            'status' => 'subscribed',
            'unsubscribed_at' => null,
        ]);

        return redirect()->route('home')->with('success', 'You have been resubscribed to our newsletter!');
    }
}
