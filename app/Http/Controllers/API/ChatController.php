<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // Slow polling to check for new messages
    public function getNewMessages(Request $request, $friendId)
    {
        $userId = Auth::id();
        
        if (!$friendId || $userId == $friendId) {
            return response()->json(['error' => 'Invalid friend ID'], 400);
        }

        // timeout duration for long polling
        $timeout = 30;

        // Start time to check how long the polling request has been active
        $startTime = time();

        while (true) {
            // Fetch any new messages for the chat between the two users
            $newMessages = Chat::where(function ($query) use ($userId, $friendId) {
                $query->where('friend_1_id', $userId)
                      ->where('friend_2_id', $friendId);
            })
            ->orWhere(function ($query) use ($userId, $friendId) {
                $query->where('friend_1_id', $friendId)
                      ->where('friend_2_id', $userId);
            })
            ->where('created_at', '>', now()->subSeconds($timeout))
            ->get();

            // If there are new messages, return them to the client
            if ($newMessages->count() > 0) {
                return response()->json([
                    'messages' => $newMessages,
                ]);
            }

            // If the timeout has been reached, break the loop and return empty response
            if (time() - $startTime >= $timeout) {
                return response()->json([
                    'messages' => [],
                ]);
            }

            sleep(2); // Wait for 2 seconds before re-checking messages
        }
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $userId = Auth::id();
        $friendId = $request->friend_id;

        $chat = Chat::create([
            'friend_1_id' => $userId,
            'friend_2_id' => $friendId,
            'sender_id' => $userId,
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $chat,
        ]);
    }
}
