<?php

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
  
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
  
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\BookController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\AdminController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\API\BookUserController;
use App\Http\Controllers\API\GenreController;
use App\Http\Controllers\API\BookUserImageController;
use App\Http\Controllers\API\TradeController;
use App\Http\Controllers\API\PostController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\FriendshipController;
use App\Http\Controllers\API\ChatController;
   
Route::controller(RegisterController::class)->group(function(){
    Route::post('register', 'register');
    Route::post('login', 'login');
});
         
Route::middleware('auth:sanctum')->group( function () {
    Route::resource('books', BookController::class);
});

// if user used isbn 
Route::post('/books/fill-via-isbn', [BookController::class, 'storeFromIsbn'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group( function () {
    Route::resource('users', UserController::class);
});

Route::middleware(['auth:sanctum','admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::post('/admin/make-admin/{id}', [AdminController::class, 'makeAdmin']); 
    Route::post('/admin/remove-admin/{id}', [AdminController::class, 'removeAdmin']); 
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/book-user', [BookUserController::class, 'index']);
    Route::post('/book-user', [BookUserController::class, 'store']); 
    Route::get('/book-user/{user_id}/{book_id}', [BookUserController::class, 'show']); 
    Route::put('/book-user/{user_id}/{book_id}', [BookUserController::class, 'update']);
    Route::delete('/book-user/{user_id}/{book_id}', [BookUserController::class, 'destroy']); 
});

Route::middleware('auth:sanctum')->group( function () {
    Route::apiResource('genres', GenreController::class);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/book-user-image', [BookUserImageController::class, 'store']); 
    Route::get('/book-user-image/{bookUserId}', [BookUserImageController::class, 'index']);
    Route::delete('/book-user-image/{id}', [BookUserImageController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/trade', [TradeController::class, 'requestTrade']);
    Route::post('/trade/{id}/respond', [TradeController::class, 'respondTrade']);
    Route::get('/trades', [TradeController::class, 'getUserTrades']); 
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/trades', [TradeController::class, 'index']);
    Route::post('/trades', [TradeController::class, 'store']);
    Route::post('/trades/{tradeId}/accept', [TradeController::class, 'accept']);
    Route::post('/trades/{tradeId}/reject', [TradeController::class, 'reject']);
    Route::post('/trades/{tradeId}/cancel', [TradeController::class, 'cancel']);
});

Route::middleware('auth:sanctum')->group( function () {
    Route::resource('posts', PostController::class);
});


// linked to specific posts, not standalone entity
Route::middleware('auth:sanctum')->group(function () {
    Route::post('posts/{postId}/comments', [CommentController::class, 'store']);
    Route::put('comments/{comment}', [CommentController::class, 'update']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);
    Route::get('comments/{comment}', [CommentController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('books/{bookId}/reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/friendships', [FriendshipController::class, 'store']);
    Route::post('/friendships/{friendshipId}/accept', [FriendshipController::class, 'accept']);
    Route::post('/friendships/{friendshipId}/reject', [FriendshipController::class, 'reject']);
    Route::post('/friendships/{friendshipId}/cancel', [FriendshipController::class, 'cancel']);
    Route::get('/friendships', [FriendshipController::class, 'index']);
    Route::get('/friendships/requests/{status}', [FriendshipController::class, 'getRequestsByStatus']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/chat/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/{friendshipId}/messages', [ChatController::class, 'getNewMessages']);
});






