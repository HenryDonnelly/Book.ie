<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Friendship;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // Slow polling to check for new messages
    public function getNewMessages(Request $request, $friendshipId)
    {
        $userId = Auth::id();
        
        if (!$friendshipId) {
            return response()->json(['error' => 'Invalid friendship ID'], 400);
        }

        $messages = Chat::with('sender:id,username')
        ->where('friendship_id', $friendshipId)
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($msg) {
            return [
                'id' => $msg->id,
                'message' => $msg->message,
                'sender_username' => $msg->sender->username,
                'created_at' => $msg->created_at,
            ];
        });
        
        return response()->json([
            'messages' => $messages,
        ]);
            
    }
    

    public function sendMessage(Request $request)
    {
        $request->validate([
            'friendship_id' => 'required|exists:friendships,id',
            'message' => 'required|string',
        ]);

        $userId = Auth::id();

        $chat = Chat::create([
            'friendship_id' => $request->friendship_id,
            'sender_id' => $userId,
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $chat,
        ]);
    }
}
