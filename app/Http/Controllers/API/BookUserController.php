<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Book;
use App\Models\BookUser;
use App\Http\Controllers\API\BookUserController;


class BookUserController extends Controller
{
    public function index()
{
    $bookUsers = BookUser::with(['book', 'user', 'images'])->get();

    // Restructure data
    $formattedData = $bookUsers->map(function ($bookUser) {
        return [
            'book' => $bookUser->book, // Book details
            'user' => $bookUser->user, // User details
            'book_user' => [ // Pivot details
                'id' => $bookUser->id,
                'condition' => $bookUser->condition,
                'status' => $bookUser->status,
                'note' => $bookUser->note,
                'images' => $bookUser->images,
                'created_at' => $bookUser->created_at,
                'updated_at' => $bookUser->updated_at
            ]
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $formattedData
    ]);
}

    

    public function store(Request $request)
    {
        // dont want user to pick which user owns the book, should always be self, so removed from validate and added check 
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'condition' => 'required|string',
            'status' => 'required|string',
            'note' => 'nullable|string',
        ]);

        $user = auth()->user();

        $user->books()->attach($request->book_id, [
            'condition' => $request->condition,
            'status' => $request->status,
            'note' => $request->note,
        ]);

        return response()->json(['message' => 'book assigned to user successfully'],201);
}

    public function show($user_id, $book_id)
    {
        $user = User::findOrFail($user_id);
        $book = $user->books()->where('book_id', $book_id)->first();

        if (!$book) {
            return response()->json(['message' => 'Book not found for this user'], 404);
        }

        return response()->json($book->pivot);
    }

    public function update(Request $request, $user_id, $book_id)
    {
        $validated = $request->validate([
            'condition' => 'sometimes|string',
            'status' => 'sometimes|string',
            'note' => 'nullable|string',
        ]);

        $user = User::findOrFail($user_id);
        // go over and learn this code
        if (!$user->books()->where('book_id', $book_id)->exists()) {
            return response()->json(['message' => 'Book not found for this user'], 404);
        }

        $user->books()->updateExistingPivot($book_id, $validated);

        return response()->json(['message' => 'Book-user relationship updated successfully']);
    }

    public function destroy($user_id, $book_id)
    {
        $user = User::findOrFail($user_id);

        if (!$user->books()->where('book_id', $book_id)->exists()) {
            return response()->json(['message' => 'Book not found for this user'], 404);
        }
        $user->books()->detach($book_id);

    return response()->json(['message' => 'Book removed from user successfully']);
    }
}