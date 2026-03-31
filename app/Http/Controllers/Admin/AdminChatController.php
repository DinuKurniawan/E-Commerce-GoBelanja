<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminChatController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Chat/Index');
    }

    public function conversations()
    {
        // Get all users who have sent messages with their last message and unread count
        $conversations = User::where('role', 'user')
            ->whereHas('chatMessages')
            ->withCount([
                'chatMessages as unread_count' => function ($query) {
                    $query->where('sender_type', 'user')
                        ->where('is_read', false);
                }
            ])
            ->with(['chatMessages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->get()
            ->map(function ($user) {
                $lastMessage = $user->chatMessages->first();
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_photo_path' => $user->profile_photo_path,
                    'last_message' => $lastMessage ? $lastMessage->message : null,
                    'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                    'unread_count' => $user->unread_count,
                ];
            })
            ->sortByDesc('last_message_time')
            ->values();

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    public function messages($userId)
    {
        $user = User::findOrFail($userId);
        
        $messages = ChatMessage::where('user_id', $userId)
            ->with(['user', 'admin'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_photo_path' => $user->profile_photo_path,
            ],
        ]);
    }

    public function reply(Request $request, $userId)
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $user = User::findOrFail($userId);

        $message = ChatMessage::create([
            'user_id' => $userId,
            'admin_id' => auth()->id(),
            'message' => $request->message,
            'sender_type' => 'admin',
            'is_read' => false,
        ]);

        $message->load(['user', 'admin']);

        // Mark all previous user messages as read
        ChatMessage::where('user_id', $userId)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Here you would broadcast the message for real-time updates
        // broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => $message,
            'success' => true,
        ]);
    }

    public function uploadAttachment(Request $request, $userId)
    {
        $request->validate([
            'attachment' => 'required|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,txt',
            'message' => 'nullable|string|max:1000',
        ]);

        $user = User::findOrFail($userId);
        $file = $request->file('attachment');
        $path = $file->store('chat-attachments', 'public');
        
        $message = ChatMessage::create([
            'user_id' => $userId,
            'admin_id' => auth()->id(),
            'message' => $request->message ?? 'Sent an attachment',
            'sender_type' => 'admin',
            'is_read' => false,
            'attachment_url' => $path,
            'attachment_type' => $file->getClientMimeType(),
        ]);

        $message->load(['user', 'admin']);

        // Mark all previous user messages as read
        ChatMessage::where('user_id', $userId)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Here you would broadcast the message for real-time updates
        // broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => $message,
            'success' => true,
        ]);
    }

    public function activeUsers()
    {
        // Get users who have sent messages in the last 5 minutes
        $activeUsers = User::where('role', 'user')
            ->whereHas('chatMessages', function ($query) {
                $query->where('created_at', '>=', now()->subMinutes(5));
            })
            ->get(['id', 'name', 'email']);

        return response()->json([
            'activeUsers' => $activeUsers,
        ]);
    }

    public function markAsRead($userId)
    {
        ChatMessage::where('user_id', $userId)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}
