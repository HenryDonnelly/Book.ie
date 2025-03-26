<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trade;
use App\Models\BookUser;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class TradeController extends Controller
{

    public function index()
    {
        $userId = Auth::id();

        $trades = Trade::where('requester_id', $userId)
        ->orWhere('receiver_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $trades,
            'message' => 'trades received successfully'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'requester_book_ids' => 'array', // array of offered books 
            'requester_book_ids.*' => 'exists:book_user,id', // validate if exists
            'receiver_book_ids' => 'array', // array of requested books
            'receiver_book_ids.*' => 'exists:book_user,id', // validate
            'receiver_id' => 'required|exists:users,id' // more validate user exist
        ]);
        $requesterId = Auth::id();

        // Ensure the requester owns the book they are offering (if any)
        if (!empty($request->requester_book_ids)) {
            $requesterBook = BookUser::whereIn('id', $request->requester_book_ids)
                ->where('user_id', $requesterId)
                ->count();

                if ($requesterBook != count($request->requester_book_ids)) {
                    return response()->json(['success' => false, 'message' => 'you dont own one or more of the books you are offering.'], 403);
                }
        }

        // Ensure the receiver owns the book they are being asked for (if any)
        if (!empty($request->receiver_book_ids)) {
            $requesterBook = BookUser::whereIn('id', $request->receiver_book_ids)
                ->where('user_id', $request->receiver_id)
                ->count();

                if ($requesterBook != count($request->receiver_book_ids)) {
                    return response()->json(['success' => false, 'message' => 'the receiver doesnt own one or more books you are requesting.'], 403);
                }
        }

        $trade = Trade::create([
            'requester_id' => $requesterId,
            'receiver_id' => $request->receiver_id,
            'trade_data' => json_encode([
                'requester_books' => array_values($request->requester_book_ids ?? []),
                'receiver_books' => array_values($request->receiver_book_ids ?? [])
]),         'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trade request sent successfully.',
            'data' => $trade
        ]);
    }

     // Modify an existing trade (Receiver updates the trade)
     public function modifyTrade(Request $request, $tradeId)
     {
         $trade = Trade::findOrFail($tradeId);
 
         // Ensure the receiver is the logged-in user
         if ($trade->receiver_id !== Auth::id()) {
             return response()->json(['success' => false, 'message' => 'Unauthorized to modify this trade.'], 403);
         }
 
             $request->validate([
             'books_to_add' => 'array',
             'books_to_add.*' => 'exists:book_user,id',
             'books_to_remove' => 'array',
             'books_to_remove.*' => 'exists:book_user,id',
         ]);
 
         // Get the current trade data
         $tradeData = json_decode($trade->trade_data, true);
         $requesterBooks = $tradeData['requester_books'] ?? [];
         $receiverBooks = $tradeData['receiver_books'] ?? [];
 
         // Merge current books with added/removable books
         $newRequesterBooks = array_merge($requesterBooks, $request->books_to_add);
         $newReceiverBooks = array_merge($receiverBooks, $request->books_to_remove);
 
         // Create a new trade based on modified offer (new trade request)
         $newTrade = Trade::create([
             'requester_id' => $trade->receiver_id, // Receiver becomes the requester
             'receiver_id' => $trade->requester_id, // Requester becomes the receiver
             'trade_data' => json_encode([
                 'requester_books' => $newRequesterBooks,
                 'receiver_books' => $newReceiverBooks,
             ]),
             'status' => 'pending' // Set the status as pending for re-approval
         ]);
 
         return response()->json([
             'success' => true,
             'message' => 'Trade offer updated successfully, new trade request created.',
             'data' => $newTrade
         ]);
     }
 

    public function accept($tradeId)
    {
        $trade = Trade::where('id', $tradeId)
            ->where('receiver_id', Auth::id()) // Only the receiver can accept
            ->where('status', 'pending')
            ->firstOrFail();

        $tradeData = json_decode($trade->trade_data, true)?? [];
        $requesterBookIds = $tradeData['requester_books'] ?? [];
        $receiverBookIds = $tradeData['receiver_books'] ?? [];

        \DB::transaction(function () use ($requesterBookIds, $receiverBookIds, $trade) {
        // assign requester’s books to receiver
        if (!empty($requesterBookIds)) {
        BookUser::whereIn('id', $requesterBookIds)->update(['user_id' => $trade->receiver_id]);
        }
        // assign receiver’s books to requester
        if (!empty($receiverBookIds)) {
        BookUser::whereIn('id', $receiverBookIds)->update(['user_id' => $trade->requester_id]);
        }

        // mark trade as accepted
        $trade->update(['status' => 'accepted']);
    });

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

