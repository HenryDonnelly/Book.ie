<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('email');
            $table->string('phone_number')->nullable()->after('address');
            $table->string('role_name')->default('free user')->after('phone_number');
        });
    }

    public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Drop the unique constraint first before dropping the column
        $table->dropUnique(['username']);
        
        $table->dropColumn(['username', 'phone_number', 'role_name']);
    });
}
};

