<?php

namespace App\Http\Controllers;

use App\Services\EmailCampaignService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmailTrackingController extends Controller
{
    protected EmailCampaignService $campaignService;

    public function __construct(EmailCampaignService $campaignService)
    {
        $this->campaignService = $campaignService;
    }

    public function trackOpen(Request $request, $campaignId, $email): Response
    {
        $this->campaignService->trackOpen($campaignId, base64_decode($email));

        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        
        return response($pixel, 200)
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    public function trackClick(Request $request, $campaignId, $email): \Illuminate\Http\RedirectResponse
    {
        $url = $request->query('url');
        
        if ($url) {
            $this->campaignService->trackClick(
                $campaignId,
                base64_decode($email),
                $url
            );
        }

        return redirect($url ?? '/');
    }
}
