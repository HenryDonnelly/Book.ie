<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BookUserImage;
use App\Models\BookUser;
use Validator;

class BookUserImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'book_user_id' => 'required|exists:book_user,id', // Ensure book_user_id exists
            'name' => 'required|url', // Ensure it's a valid URL
        ]);
    
        // Ensure the authenticated user owns this book
        $bookUser = BookUser::where('id', $request->book_user_id)
                            ->where('user_id', auth()->id()) // Only allow the owner
                            ->firstOrFail();
    
        // Save image
        $image = new BookUserImage([
            'book_user_id' => $bookUser->id,
            'name' => $request->name, // Store the URL
        ]);
        $image->save();
    
        return response()->json([
            'success' => true,
            'message' => 'Image added successfully',
            'data' => $image
        ]);
    }
    

    public function index($bookUserId)
    {
        $images = BookUserImage::where('book_user_id', $bookUserId)->get();

        return response()->json([
            'success' => true,
            'data' => $images,
            'message' => 'User book images retrieved successfully.'
        ]);
    }


    public function destroy($id)
    {
        $image = BookUserImage::find($id);

        if (!$image) {
            return response()->json(['success' => false, 'message' => 'Image not found.'], 404);
        }

        $image->delete();

        return response()->json(['success' => true, 'message' => 'User book image deleted successfully.']);
    }
}
