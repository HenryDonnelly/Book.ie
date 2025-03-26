<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendshipController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|exists:users,username',
        ]);

        $requesterId = Auth::id();
        $receiver = \App\Models\User::where('username', $request->username)->firstOrFail();
        $receiverId = $receiver->id;

        // user cannot send a friend request to themselves
        if ($requesterId == $receiverId) {
            return response()->json(['success' => false, 'message' => 'You cannot send a request to yourself.'], 400);
        }

        // check request does not already exist
        $existingRequest = Friendship::where(function ($query) use ($requesterId, $receiverId) {
            $query->where('requester_id', $requesterId)
                  ->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($requesterId, $receiverId) {
            $query->where('requester_id', $receiverId)
                  ->where('receiver_id', $requesterId);
        })->first();

        if ($existingRequest) {
            return response()->json(['success' => false, 'message' => 'Friendship request already exists.'], 400);
        }

        $friendship = Friendship::create([
            'requester_id' => $requesterId,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        $requesterUsername = \App\Models\User::find($requesterId)->username;
        $receiverUsername = $receiver->username;

        return response()->json([
            'success' => true,
            'message' => 'Friendship request sent successfully.',
            'data' => $friendship,
            'requester_username' => $requesterUsername,
            'receiver_username' => $receiverUsername,
        ]);
    }

    public function accept($friendshipId)
    {
        $friendship = Friendship::where('id', $friendshipId)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        $requesterUsername = \App\Models\User::find($friendship->requester_id)->username;
        $receiverUsername = \App\Models\User::find($friendship->receiver_id)->username;

        return response()->json([
            'success' => true,
            'message' => 'Friendship request accepted.',
            'data' => $friendship,
            'requester_username' => $requesterUsername,
            'receiver_username' => $receiverUsername,
        ]);
    }

    public function reject($friendshipId)
    {
        $friendship = Friendship::where('id', $friendshipId)
            ->where('receiver_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'rejected']);

        $requesterUsername = \App\Models\User::find($friendship->requester_id)->username;
        $receiverUsername = \App\Models\User::find($friendship->receiver_id)->username;

        return response()->json([
            'success' => true,
            'message' => 'Friendship request rejected.',
            'data' => $friendship,
            'requester_username' => $requesterUsername,
            'receiver_username' => $receiverUsername,
        ]);
    }

    public function cancel($friendshipId)
    {
        $friendship = Friendship::where('id', $friendshipId)
            ->where('requester_id', Auth::id())
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->delete();

        return response()->json([
            'success' => true,
            'message' => 'Friendship request canceled.',
        ]);
    }

    public function index()
    {
        $userId = Auth::id();

        $friendships = Friendship::where('requester_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

            $friendships->each(function ($friendship) {
                $friendship->requester_username = \App\Models\User::find($friendship->requester_id)->username;
                $friendship->receiver_username = \App\Models\User::find($friendship->receiver_id)->username;
            });

        return response()->json([
            'success' => true,
            'data' => $friendships,
            'message' => 'Friendships retrieved successfully.',
        ]);
    }


    public function getRequestsByStatus($status)
    {
        if (!in_array($status, ['pending', 'accepted', 'rejected'])) {
            return response()->json(['success' => false, 'message' => 'Invalid status.'], 400);
        }

        $userId = Auth::id();

        $friendships = Friendship::where(function ($query) use ($userId, $status) {
            $query->where('requester_id', $userId)
                ->where('status', $status)
                ->orWhere('receiver_id', $userId)
                ->where('status', $status);
        })->get();

        $friendships->each(function ($friendship) {
            $friendship->requester_username = \App\Models\User::find($friendship->requester_id)->username;
            $friendship->receiver_username = \App\Models\User::find($friendship->receiver_id)->username;
        });

        return response()->json([
            'success' => true,
            'data' => $friendships,
            'message' => ucfirst($status) . ' friendship requests retrieved successfully.',
        ]);
    }
}
