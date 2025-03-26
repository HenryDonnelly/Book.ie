<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\User;

class WishlistController extends Controller
{

    public function index()
    {
        $user = auth()->user();
        $wishlist = $user->wishlist; // Get the books in their wishlist

        return response()->json([
            'success' => true,
            'data' => $wishlist
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $user = auth()->user(); 

        if ($user->wishlist->contains($request->book_id)) {
            return response()->json([
                'message' => 'This book is already in your wishlist.'
            ], 400);
        }

        $user->wishlist()->attach($request->book_id);

        return response()->json([
            'message' => 'Book added to wishlist successfully.'
        ], 201);
    }

    public function destroy($book_id)
    {
        $user = auth()->user();

        if (!$user->wishlist->contains($book_id)) {
            return response()->json([
                'message' => 'This book is not in your wishlist.'
            ], 404);
        }

        $user->wishlist()->detach($book_id);

        return response()->json([
            'message' => 'Book removed from wishlist successfully.'
        ]);
    }
    public function toggleWishlist(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $user = auth()->user();

        if ($user->wishlist()->where('book_id', $request->book_id)->exists()) {
            $user->wishlist()->detach($request->book_id);
            return response()->json(['added' => false]);
        } else {
            $user->wishlist()->attach($request->book_id);
            return response()->json(['added' => true]);
        }
    }
}
