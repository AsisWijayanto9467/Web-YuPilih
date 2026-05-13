<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function getAdmins(Request $request) {
        try {
            $query = User::with('division')->where('role', 'admin');

            // Search functionality
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('username', 'LIKE', "%{$search}%")
                    ->orWhereHas('division', function($div) use ($search) {
                        $div->where('name', 'LIKE', "%{$search}%");
                    });
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $allowedSorts = ['username', 'created_at', 'updated_at'];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Pagination
            $perPage = (int) $request->get('per_page', 10);
            $admins = $query->paginate($perPage);

            return response()->json([
                "status" => "success",
                "totalElements" => $admins->total(),
                "content" => $admins->map(function ($admin) {
                    return [
                        "id"         => $admin->id,
                        "username"   => $admin->username,
                        "division"   => $admin->division->name ?? null,
                        "created_at" => $admin->created_at,
                        "updated_at" => $admin->updated_at,
                    ];
                }),
                "pagination" => [
                    "current_page" => $admins->currentPage(),
                    "last_page" => $admins->lastPage(),
                    "per_page" => $admins->perPage(),
                    "total" => $admins->total(),
                    "from" => $admins->firstItem(),
                    "to" => $admins->lastItem()
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error in getAdmins: ' . $e->getMessage());

            return response()->json([
                "status" => "error",
                "message" => "Failed to fetch admins"
            ], 500);
        }
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

    public function getUsers(Request $request) {
        try {
            $query = User::with('division')->where('role', 'user');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('username', 'LIKE', "%{$search}%")
                    ->orWhereHas('division', function($div) use ($search) {
                        $div->where('name', 'LIKE', "%{$search}%");
                    });
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $allowedSorts = ['username', 'created_at', 'updated_at'];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $perPage = (int) $request->get('per_page', 10);
            $users = $query->paginate($perPage);

            return response()->json([
                "status" => "success",
                "totalElements" => $users->total(),
                "content" => $users->map(function ($user) {
                    return [
                        "id"          => $user->id,
                        "username"    => $user->username,
                        "division_id" => $user->division_id,
                        "division"    => $user->division->name ?? null,
                        "created_at"  => $user->created_at,
                        "updated_at"  => $user->updated_at,
                    ];
                }),
                "pagination" => [
                    "current_page" => $users->currentPage(),
                    "last_page" => $users->lastPage(),
                    "per_page" => $users->perPage(),
                    "total" => $users->total(),
                    "from" => $users->firstItem(),
                    "to" => $users->lastItem()
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error in getUsers: ' . $e->getMessage());

            return response()->json([
                "status" => "error",
                "message" => "Failed to fetch users"
            ], 500);
        }
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
