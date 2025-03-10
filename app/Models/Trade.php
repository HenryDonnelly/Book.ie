<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trade extends Model
{
    use HasFactory;

    protected $fillable = ['requester_id', 'receiver_id', 'requester_book_id', 'receiver_book_id', 'status'];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function requesterBook()
    {
        return $this->belongsTo(BookUser::class, 'requester_book_id');
    }

    public function receiverBook()
    {
        return $this->belongsTo(BookUser::class, 'receiver_book_id');
    }
}
