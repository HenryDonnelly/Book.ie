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
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn(['friend_1_id', 'friend_2_id']);
            $table->foreignId('friendship_id')->constrained('friendships')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropForeign(['friendship_id']);
            $table->dropColumn('friendship_id');
            $table->foreignId('friend_1_id')->nullable();
            $table->foreignId('friend_2_id')->nullable();
        });
    }
};
