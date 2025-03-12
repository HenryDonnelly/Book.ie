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
        $table->json('trade_data')->nullable();
        $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled'])->default('pending');
        $table->timestamps();
        $table->foreign('requester_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
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
