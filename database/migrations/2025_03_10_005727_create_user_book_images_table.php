<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_book_images', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('book_user_id');
            $table->timestamps();

            // fk linking to book user
            $table->foreign('book_user_id')->references('id')->on('book_user')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_book_images');
    }
};
