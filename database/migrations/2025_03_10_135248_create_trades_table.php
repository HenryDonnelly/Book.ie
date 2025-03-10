<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
    Schema::create('trades', function (Blueprint $table) {
        $table->id();
        $table->foreignId('requester_id')->constrained('users')->onDelete('cascade'); // Who is requesting the trade
        $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade'); // Who is receiving the request
        $table->foreignId('requester_book_id')->nullable()->constrained('book_user')->onDelete('cascade'); // The book the requester is offering
        $table->foreignId('receiver_book_id')->nullable()->constrained('book_user')->onDelete('cascade'); // The book the receiver is offering
        $table->enum('status', ['pending', 'accepted', 'declined', 'cancelled'])->default('pending');
        $table->timestamps();
    });
}  

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};
