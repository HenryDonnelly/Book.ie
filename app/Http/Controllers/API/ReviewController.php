<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Validator;
use App\Models\Book;
use App\Models\Review;



class ReviewController extends BaseController
{
    public function store(Request $request, $bookId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 400);
        }

        $book = Book::find($bookId);
        if (!$book) {
            return $this->sendError('Book not found.', [], 404);
        }

        $existingReview = Review::where('book_id', $bookId)
                            ->where('user_id', auth()->id())
                            ->first();

        if ($existingReview) {
            return $this->sendError('You have already reviewed this book.', [], 400);
        }

        $review = new Review();
        $review->book_id = $bookId;
        $review->user_id = auth()->id(); // currently authenticated user
        $review->rating = $request->rating;
        $review->comment = $request->comment;
        $review->save();

        return $this->sendResponse($review, 'Review created successfully.');
    }

    public function update(Request $request, $reviewId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|between:1,5', 
            'comment' => 'nullable|string|max:1000', 
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 400);
        }

        $review = Review::find($reviewId);

        if (!$review) {
            return $this->sendError('Review not found.', [], 404);
        }

        if ($review->user_id !== auth()->id()) {
            return $this->sendError('You are not authorized to update this review.', [], 403);
        }

        $review->rating = $request->rating;
        $review->comment = $request->comment;
        $review->save();

        return $this->sendResponse($review, 'Review updated successfully.');
    }

    /**
     * Display the specified review.
     *
     * @param  int  $reviewId
     * @return \Illuminate\Http\Response
     */
    public function show($reviewId)
    {
        $review = Review::find($reviewId);

        if (!$review) {
            return $this->sendError('Review not found.', [], 404);
        }

        return $this->sendResponse($review, 'Review retrieved successfully.');
    }

    /**
     * Remove the specified review.
     *
     * @param  int  $reviewId
     * @return \Illuminate\Http\Response
     */
    public function destroy($reviewId)
    {
        $review = Review::find($reviewId);

        if (!$review) {
            return $this->sendError('Review not found.', [], 404);
        }

        if ($review->user_id !== auth()->id()) {
            return $this->sendError('You are not authorized to delete this review.', [], 403);
        }

        $review->delete();

        return $this->sendResponse([], 'Review deleted successfully.');
    }

}
