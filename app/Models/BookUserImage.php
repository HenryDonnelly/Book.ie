<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\BookUser;


class BookUserImage extends Model
{
    use HasFactory;

    protected $fillable = ['book_user_id', 'name'];

    public function bookUser()
    {
        return $this->belongsTo(BookUser::class, 'book_user_id');
    }
}