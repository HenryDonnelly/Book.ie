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


   
Route::controller(RegisterController::class)->group(function(){
    Route::post('register', 'register');
    Route::post('login', 'login');
});
         
Route::middleware('auth:sanctum')->group( function () {
    Route::resource('books', BookController::class);
});

Route::middleware('auth:sanctum')->group( function () {
    Route::resource('users', UserController::class);
});

Route::middleware(['auth:sanctum','admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/book-user', [BookUserController::class, 'index']);  // List all book-user entries
    Route::post('/book-user', [BookUserController::class, 'store']); // Assign book to user
    Route::get('/book-user/{user_id}/{book_id}', [BookUserController::class, 'show']); // Get single entry
    Route::put('/book-user/{user_id}/{book_id}', [BookUserController::class, 'update']); // Update book-user
    Route::delete('/book-user/{user_id}/{book_id}', [BookUserController::class, 'destroy']); // Remove book from user
});

Route::middleware('auth:sanctum')->group( function () {
    Route::apiResource('genres', GenreController::class);
});

