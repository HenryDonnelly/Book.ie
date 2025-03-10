<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trade;
use App\Models\BookUser;
use App\Models\User;

class TradeController extends Controller
{

    public function index()
    {
        $userId = Auth::id();

        $sentTrades = Trade::where('requester_id', $userId)
            ->with(['receiver', 'requesterBook', 'receiverBook'])
            ->orderBy('created_at', 'desc')
            ->get();

        $receivedTrades = Trade::where('receiver_id', $userId)
            ->with(['requester', 'requesterBook', 'receiverBook'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'sent_trades' => $sentTrades,
            'received_trades' => $receivedTrades
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'requester_book_id' => 'nullable|exists:book_users,id', // can be null (offering nothing)
            'receiver_book_id' => 'nullable|exists:book_users,id', // can be null (receiving nothing)
            'receiver_id' => 'required|exists:users,id' // the user to trade with
        ]);

        $requesterId = Auth::id();

        // Ensure the requester owns the book they are offering (if any)
        if ($request->requester_book_id) {
            $requesterBook = BookUser::where('id', $request->requester_book_id)
                ->where('user_id', $requesterId)
                ->first();

            if (!$requesterBook) {
                return response()->json(['success' => false, 'message' => 'You do not own the book you are offering.'], 403);
            }
        }

        // Ensure the receiver owns the book they are being asked for (if any)
        if ($request->receiver_book_id) {
            $receiverBook = BookUser::where('id', $request->receiver_book_id)
                ->where('user_id', $request->receiver_id)
                ->first();

            if (!$receiverBook) {
                return response()->json(['success' => false, 'message' => 'The receiver does not own the book you are requesting.'], 403);
            }
        }

        $trade = Trade::create([
            'requester_id' => $requesterId,
            'receiver_id' => $request->receiver_id,
            'requester_book_id' => $request->requester_book_id,
            'receiver_book_id' => $request->receiver_book_id,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trade request sent successfully.',
            'data' => $trade
        ]);
    }

    public function accept($tradeId)
    {
        $trade = Trade::where('id', $tradeId)
            ->where('receiver_id', Auth::id()) // Only the receiver can accept
            ->where('status', 'pending')
            ->firstOrFail();

        // mark trade as accepted
        $trade->update(['status' => 'accepted']);

        return response()->json([
            'success' => true,
            'message' => 'Trade accepted successfully.',
            'data' => $trade
        ]);
    }

    public function reject($tradeId)
    {
        $trade = Trade::where('id', $tradeId)
            ->where('receiver_id', Auth::id()) // only the receiver can reject
            ->where('status', 'pending')
            ->firstOrFail();

        // Mark trade as rejected
        $trade->update(['status' => 'rejected']);

        return response()->json([
            'success' => true,
            'message' => 'Trade rejected successfully.',
            'data' => $trade
        ]);
    }

    public function cancel($tradeId)
    {
        $trade = Trade::where('id', $tradeId)
            ->where('requester_id', Auth::id()) // Only the sender can cancel
            ->where('status', 'pending')
            ->firstOrFail();

        // Mark trade as canceled
        $trade->update(['status' => 'canceled']);

        return response()->json([
            'success' => true,
            'message' => 'Trade canceled successfully.',
            'data' => $trade
        ]);

    }
}

