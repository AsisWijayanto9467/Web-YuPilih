<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function getAdmins(Request $request)
    {

        $admins = User::with('division')->where('role', 'admin')->get();

        return response()->json([
            "totalElements" => $admins->count(),
            "content" => $admins->map(function ($admin) {
                return [
                    "id"         => $admin->id,
                    "username"   => $admin->username,
                    "division"   => $admin->division?->name,
                    "created_at"=> $admin->created_at->format('Y-m-d H:i:s'),
                    "updated_at"=> $admin->updated_at->format('Y-m-d H:i:s'),
                ];
            })
        ], 200);
    }

    public function createUser(Request $request)
    {
        $username = User::where("username", $request->username)->first();

        if($username) {
            return response()->json([
                "status" => "invalid",
                "message" => "Username already exists"
            ], 400);
        }

        $request->validate([
            'username' => [
                'required',
                'string',
                'min:8',
                'max:20',
                'unique:users,username'
            ],
            'division_id' => 'required|exists:divisions,id',
            'role' => 'required|in:admin,user'
        ]);

        $defaultPassword = "Password123";

        $user = User::create([
            'username'    => $request->username,
            'password'    => Hash::make($defaultPassword),
            'division_id' => $request->division_id,
            'role'        => $request->role
        ]);

        return response()->json([
            "status"   => "success",
            "username" => $user->username
        ], 201);
    }

    public function getUsers(Request $request)
    {
        $users = User::with('division')
            ->where('role', 'user')
            ->get();

        return response()->json([
            "totalElements" => $users->count(),
            "content" => $users->map(function ($user) {
                return [
                    "id"          => $user->id,
                    "username"    => $user->username,
                    "division_id" => $user->division_id,
                    "division"    => $user->division?->name,
                    "created_at" => $user->created_at->format('Y-m-d H:i:s'),
                    "updated_at" => $user->updated_at->format('Y-m-d H:i:s'),
                ];
            })
        ], 200);
    }

    public function updateUser(Request $request, $id)
    {

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                "status"  => "invalid",
                "message" => "User not found"
            ], 404);
        }

        $request->validate([
            'username' => [
                'required',
                'string',
                'min:8',
                'max:20',
                'unique:users,username,' . $user->id
            ],
            'division_id' => 'required|exists:divisions,id'
        ]);

        $user->update([
            'username'    => $request->username,
            'division_id' => $request->division_id
        ]);

        return response()->json([
            "status"   => "success",
            "username" => $user->username . " created"
        ], 201);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                "status"  => "not-found",
                "message" => "User Not found"
            ], 403);
        }

        $user->delete();

        return response()->noContent(); 
    }


    public function showUser(Request $request, $id)
    {
        $user = User::with('division')->find($id);

        if (!$user) {
            return response()->json([
                "message" => "User not found"
            ], 404);
        }

        return response()->json([
            "id" => $user->id,
            "username" => $user->username,
            "division_id" => $user->division_id
        ]);
    }

}
