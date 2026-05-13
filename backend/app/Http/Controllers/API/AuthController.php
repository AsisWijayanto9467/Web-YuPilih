<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request) {


        $validator = Validator::make($request->all(), [
            'username' => [
                'required',
                'string',
                'min:8',
                'max:20',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                "message" => "Invalid field",
                "errors"  => $validator->errors()
            ], 422);
        }

        $user = User::with('division')->where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                "message" => "Email or password incorrect"
            ], 401);
        }

        $token = $user->createToken($user->username . '_token')->plainTextToken;

        if (Hash::check("Password123", $user->password)) {
            return response()->json([
                "message" => "Change password",
                "use this token" => $token
            ], 403);
        }

        return response()->json([
            "message" => "Login success",
            "user" => [
                "username"      => $user->username,
                "role"          => $user->role,
                "accessToken"   => $token,
                "division_id"   => $user->division?->id,
                "division_name" => $user->division?->name,
            ]
        ], 200);
    }


    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            "message" => "Logout is Success"
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'new_password' => [
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
        ]);

        $user = $request->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                "status" => "invalid",
                "message" => "Default password does not match"
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        $user->tokens()->delete();

        return response()->json([
            "status" => "success",
            "message" => "password already change"
        ], 201);
    }
}
