<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserNotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = UserNotification::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('User/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(UserNotification $notification): RedirectResponse
    {
        abort_unless((int) $notification->user_id === (int) auth()->id(), 403);

        $notification->update(['is_read' => true]);

        return back()->with('success', 'Notifikasi ditandai sudah dibaca.');
    }
}
