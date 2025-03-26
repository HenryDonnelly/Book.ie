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
    Schema::table('book_user_images', function (Blueprint $table) {
        $table->renameColumn('name', 'image');
    });
}

public function down()
{
    Schema::table('book_user_images', function (Blueprint $table) {
        $table->renameColumn('image', 'name');
    });
}

};
