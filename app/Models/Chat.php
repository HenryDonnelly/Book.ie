<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = ['friend_1_id', 'friend_2_id', 'sender_id', 'message'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function friend1()
    {
        return $this->belongsTo(User::class, 'friend_1_id');
    }

    public function friend2()
    {
        return $this->belongsTo(User::class, 'friend_2_id');
    }
}

