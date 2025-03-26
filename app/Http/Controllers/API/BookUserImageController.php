<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BookUserImage;
use App\Models\BookUser;
use Illuminate\Support\Facades\Storage;

class BookUserImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'book_user_id' => 'required|exists:book_user,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $bookUser = BookUser::where('id', $request->book_user_id)
                            ->where('user_id', auth()->id())
                            ->firstOrFail();

        $image = $request->file('image');
        $imagePath = $image->store('book_images', 's3');
    
        $bookUserImage = new BookUserImage([
            'book_user_id' => $bookUser->id,
            'name' => $imagePath,
        ]);
        $bookUserImage->save();
    
        return response()->json([
            'success' => true,
            'message' => 'Image added successfully',
            'data' => $bookUserImage
        ]);
    }
    
    public function index($bookUserId)
    {
        $images = BookUserImage::where('book_user_id', $bookUserId)->get();

        $images->each(function ($image) {
            $image->full_url = Storage::disk('s3')->url($image->name);
        });

        return response()->json([
            'success' => true,
            'data' => $images,
            'message' => 'User book images retrieved successfully.'
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $image = BookUserImage::find($id);
        if (!$image) {
            return response()->json(['success' => false, 'message' => 'Image not found.'], 404);
        }

        Storage::disk('s3')->delete($image->name);

        $newImage = $request->file('image');
        $newImagePath = $newImage->store('book_images', 's3');

        $image->name = $newImagePath;
        $image->save();

        return response()->json([
            'success' => true,
            'message' => 'Image updated successfully.',
            'data' => $image,
        ]);
    }

    public function destroy($id)
    {
        $image = BookUserImage::find($id);

        if (!$image) {
            return response()->json(['success' => false, 'message' => 'Image not found.'], 404);
        }

        Storage::disk('s3')->delete($image->name);
        $image->delete();
        return response()->json(['success' => true, 'message' => 'User book image deleted successfully.']);
    }
}
