<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaign;
use App\Services\EmailCampaignService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EmailCampaignController extends Controller
{
    protected EmailCampaignService $campaignService;

    public function __construct(EmailCampaignService $campaignService)
    {
        $this->campaignService = $campaignService;
    }

    public function index(): Response
    {
        $campaigns = EmailCampaign::latest()
            ->get()
            ->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'subject' => $campaign->subject,
                    'type' => $campaign->type,
                    'status' => $campaign->status,
                    'recipients_count' => $campaign->recipients_count,
                    'opened_count' => $campaign->opened_count,
                    'clicked_count' => $campaign->clicked_count,
                    'open_rate' => round($campaign->getOpenRate(), 2),
                    'click_rate' => round($campaign->getClickRate(), 2),
                    'scheduled_at' => $campaign->scheduled_at?->format('Y-m-d H:i'),
                    'sent_at' => $campaign->sent_at?->format('Y-m-d H:i'),
                    'created_at' => $campaign->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Admin/EmailCampaigns/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/EmailCampaigns/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:newsletter,promotion,abandoned_cart,product_recommendation,re_engagement',
            'recipient_filter' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
            'status' => 'required|in:draft,scheduled',
        ]);

        $campaign = EmailCampaign::create($validated);

        if ($validated['status'] === 'scheduled' && $validated['scheduled_at']) {
            return redirect()->route('admin.email-campaigns.index')
                ->with('success', 'Campaign scheduled successfully!');
        }

        return redirect()->route('admin.email-campaigns.index')
            ->with('success', 'Campaign created successfully!');
    }

    public function edit($id): Response
    {
        $campaign = EmailCampaign::findOrFail($id);

        return Inertia::render('Admin/EmailCampaigns/Edit', [
            'campaign' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'subject' => $campaign->subject,
                'content' => $campaign->content,
                'type' => $campaign->type,
                'recipient_filter' => $campaign->recipient_filter,
                'scheduled_at' => $campaign->scheduled_at?->format('Y-m-d\TH:i'),
                'status' => $campaign->status,
            ],
        ]);
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $campaign = EmailCampaign::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:newsletter,promotion,abandoned_cart,product_recommendation,re_engagement',
            'recipient_filter' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
            'status' => 'required|in:draft,scheduled',
        ]);

        $campaign->update($validated);

        return redirect()->route('admin.email-campaigns.index')
            ->with('success', 'Campaign updated successfully!');
    }

    public function destroy($id): RedirectResponse
    {
        $campaign = EmailCampaign::findOrFail($id);
        $campaign->delete();

        return redirect()->route('admin.email-campaigns.index')
            ->with('success', 'Campaign deleted successfully!');
    }

    public function send($id): RedirectResponse
    {
        $campaign = EmailCampaign::findOrFail($id);

        if ($campaign->status === 'sent') {
            return back()->with('error', 'Campaign already sent!');
        }

        $this->campaignService->sendCampaign($campaign);

        $campaign->update([
            'sent_at' => now(),
        ]);

        return redirect()->route('admin.email-campaigns.index')
            ->with('success', 'Campaign is being sent!');
    }

    public function schedule(Request $request, $id): RedirectResponse
    {
        $campaign = EmailCampaign::findOrFail($id);

        $validated = $request->validate([
            'scheduled_at' => 'required|date|after:now',
        ]);

        $campaign->update([
            'scheduled_at' => $validated['scheduled_at'],
            'status' => 'scheduled',
        ]);

        return redirect()->route('admin.email-campaigns.index')
            ->with('success', 'Campaign scheduled successfully!');
    }
}
