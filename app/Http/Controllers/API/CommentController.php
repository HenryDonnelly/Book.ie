<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\BaseController as BaseController;
use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Post;
use Validator;
use App\Http\Resources\CommentResource;

class CommentController extends BaseController
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $postId
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $postId)
    {
        $input = $request->all();

        $validator = Validator::make($input, [
            'text' => 'required|string|max:1000', 
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 400);
        }

        $input['post_id'] = $postId;
        $input['user_id'] = auth()->id();
        $comment = Comment::create($input);

        $comment->load('user');


        return $this->sendResponse(new CommentResource($comment), 'Comment created successfully.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Comment $comment)
    {
        $input = $request->all();

        $validator = Validator::make($input, [
            'text' => 'sometimes|required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors(), 400);
        }

        if (isset($input['text'])) {
            $comment->text = $input['text'];
        }

        $comment->save();

        return $this->sendResponse(new CommentResource($comment), 'Comment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Comment $comment)
    {
        $comment->delete();
        return $this->sendResponse([], 'Comment deleted successfully.');
    }
}