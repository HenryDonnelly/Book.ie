<?php
   
namespace App\Http\Controllers\API;
   
use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use App\Models\User;
use Validator;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
   
class UserController extends BaseController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(): JsonResponse
    {
        if (auth()->user()->role_name !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::all();
    
        return $this->sendResponse(UserResource::collection($users), 'users retrieved successfully.');
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
   
        $validator = Validator::make($input, [
            'name'=> 'required',
            'email'=> 'required|email|unique:users,email',
            'username'=> 'required|unique:users,username',
            'password'=> 'required',
            'address'=> 'required',
            'phone_number'=> 'required'
        ]);
   
        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }

        $input['role_name'] = 'free user'; // force 

        $input['password'] = bcrypt($input['password']); //hash

   
        $user = User::create($input);
   
        return $this->sendResponse(new UserResource($user), 'user created successfully.');
    } 
   
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id): JsonResponse
    {
        $user = User::find($id);
  
        if (is_null($user)) {
            return $this->sendError('user not found.');
        }
   
        return $this->sendResponse(new UserResource($user), 'user retrieved successfully.');
    }
    
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user): JsonResponse
    {
        if (auth()->user()->role_name !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }   
        
        $input = $request->all(); 

        $validator = Validator::make($input, [
            'name'=> 'sometimes|string|',
            'email'=> 'sometimes|email|unique:users,email',
            'username'=> 'sometimes|unique:users,username',
            'password'=> 'sometimes',
            'address'=> 'sometimes',
            'phone_number'=> 'sometimes'
        ]);
   
        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }

        $input = $request->all();

        // only update if field is required to do so
   
        if (isset($input['name'])) {
            $user->name = $input['name'];
        }
        if (isset($input['email'])) {
            $user->email = $input['email'];
        }
        if (isset($input['username'])) {
            $user->username = $input['username'];
        }
        if (isset($input['password'])) {
            $user->password = bcrypt($input['password']);
        }
        if (isset($input['address'])) {
            $user->address = $input['address'];
        }   
        if (isset($input['phone_number'])) {
            $user->phone_number = $input['phone_number'];
        }     
        $user->save();
   
        return $this->sendResponse(new UserResource($user), 'user updated successfully.');
    }
   
    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user): JsonResponse
    {

        if (auth()->user()->role_name !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->delete();
   
        return $this->sendResponse([], 'user deleted successfully.');
    }

    public function showSelf(): JsonResponse
    {
        return $this->sendResponse(new UserResource(auth()->user()), 'current user retrieved successfully.');
    }

    public function updateSelf(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'name'=> 'sometimes|string',
            // unique email checks
            'email'=> 'sometimes|email|unique:users,email,' . $user->id,
            // Notice: no username update allowed!
            'password'=> 'sometimes',
            'address'=> 'sometimes',
            'phone_number'=> 'sometimes'
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }

        if ($request->filled('name')) $user->name = $request->name;
        if ($request->filled('email')) $user->email = $request->email;
        if ($request->filled('password')) $user->password = bcrypt($request->password);
        if ($request->filled('address')) $user->address = $request->address;
        if ($request->filled('phone_number')) $user->phone_number = $request->phone_number;

        $user->save();
        return $this->sendResponse(new UserResource($user), 'your account has been updated.');
    }

    public function destroySelf(): JsonResponse
    {
        $user = auth()->user();
        $user->delete();
        return $this->sendResponse([], 'your account has been deleted.');
    }
}