<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = ['post_id', 'user_id', 'text', 'upvotes', 'upvoters'];

    protected $casts = [
        'upvoters' => 'array',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function incrementUpvotes()
    {
        $this->increment('upvotes');
    }

    public function decrementUpvotes()
    {
        $this->decrement('upvotes');
    }
}
