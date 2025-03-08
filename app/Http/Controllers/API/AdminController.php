<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;


class AdminController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json(['users' => $users]);
    }

    public function makeAdmin($id)
    {
        $user = User::findOrFail($id);
        $user->role_name = 'admin';
        $user->save();

        return response()->json(['message' => 'User promoted to admin successfully']);
    }

    public function removeAdmin($id)
    {
        $user = User::findOrFail($id);
        $user->role_name = 'free user';
        $user->save();

        return response()->json(['message' => 'Admin rights removed']);
    }
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'message' => 'Welcome to the Admin Dashboard',
        ]);
    }
}
