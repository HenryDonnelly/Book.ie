<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = ['friendship_id', 'sender_id', 'message'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function friendship()
    {
        return $this->belongsTo(Friendship::class);
    }
}

