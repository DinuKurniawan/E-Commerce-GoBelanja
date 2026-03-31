<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserChatController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $messages = ChatMessage::where('user_id', $user->id)
            ->with(['user', 'admin'])
            ->orderBy('created_at', 'asc')
            ->get();

        $unreadCount = ChatMessage::where('user_id', $user->id)
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->count();

        return response()->json([
            'messages' => $messages,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $message = ChatMessage::create([
            'user_id' => auth()->id(),
            'message' => $request->message,
            'sender_type' => 'user',
            'is_read' => false,
        ]);

        $message->load(['user', 'admin']);

        // Here you would broadcast the message for real-time updates
        // broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => $message,
            'success' => true,
        ]);
    }

    public function markAsRead($messageId)
    {
        $message = ChatMessage::where('id', $messageId)
            ->where('user_id', auth()->id())
            ->where('sender_type', 'admin')
            ->firstOrFail();

        $message->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        ChatMessage::where('user_id', auth()->id())
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'attachment' => 'required|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,txt',
            'message' => 'nullable|string|max:1000',
        ]);

        $file = $request->file('attachment');
        $path = $file->store('chat-attachments', 'public');
        
        $message = ChatMessage::create([
            'user_id' => auth()->id(),
            'message' => $request->message ?? 'Sent an attachment',
            'sender_type' => 'user',
            'is_read' => false,
            'attachment_url' => $path,
            'attachment_type' => $file->getClientMimeType(),
        ]);

        $message->load(['user', 'admin']);

        // Here you would broadcast the message for real-time updates
        // broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => $message,
            'success' => true,
        ]);
    }

    public function checkNewMessages()
    {
        $user = auth()->user();
        
        $lastMessage = ChatMessage::where('user_id', $user->id)
            ->latest()
            ->first();

        $unreadCount = ChatMessage::where('user_id', $user->id)
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->count();

        return response()->json([
            'lastMessage' => $lastMessage,
            'unreadCount' => $unreadCount,
            'hasNewMessages' => $unreadCount > 0,
        ]);
    }
}
