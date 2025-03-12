<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use Validator;
use App\Http\Resources\PostResource;

class PostController extends BaseController
{
    public function index()
    {
        $posts = Post::with('user', 'comments.user')->get(); // eager load user and comments.user
        return $this->sendResponse(PostResource::collection($posts), 'Posts retrieved successfully.');
    }

    public function store(Request $request)
    {
        $input = $request->all();

        $validator = Validator::make($input, [
            'title' => 'required|string|max:80',
            'content' => 'required|string|max:1500',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 400);
        }

        $input['user_id'] = auth()->id();
        $post = Post::create($input);

        return $this->sendResponse(new PostResource($post), 'Post created successfully.');
    }

    public function show(Post $post)
    {
        $post = $post->load('user', 'comments.user');

        if (is_null($post)) {
            return $this->sendError('Post not found.');
        }

        return $this->sendResponse(new PostResource($post), 'Post retrieved successfully.');
    }

    public function update(Request $request, Post $post)
    {

        if ($post->user_id !== auth()->id()) {
            return $this->sendError('You are not authorized to update this post.', [], 403);
        }

        $input = $request->all();

        $validator = Validator::make($input, [
            'title' => '|sometimes|string|max:80',
            'content' => '|sometimes|string|max:1500',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 400);
        }

        if (isset($input['title'])) {
            $post->title = $input['title'];
        }
        if (isset($input['content'])) {
            $post->content = $input['content'];
        }

        $post->save();

        return $this->sendResponse(new PostResource($post), 'Post updated successfully.');
    }

    public function destroy(Post $post)
    {

        if (auth()->user()->role !== 'admin') {
            return $this->sendError('You are not authorized to delete this post.', [], 403);
        }
        $post->delete();
        return $this->sendResponse([], 'Post deleted successfully.');
    }
}