<?php

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\DivisionController;
use App\Http\Controllers\API\PollController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::prefix("v1")->group(function () {
    Route::prefix("auth")->group(function () {
        Route::post("/login", [AuthController::class, "login"]);
        Route::post("/logout", [AuthController::class, "logout"])->middleware("auth:sanctum");
        Route::post("/change-password", [AuthController::class, "changePassword"])->middleware("auth:sanctum");
    });


    Route::middleware("auth:sanctum")->group(function() {
        Route::prefix("admin")->group(function() {
            Route::get("/", [AdminController::class, "getAdmins"])->middleware("admin");
        });

        Route::prefix("users")->group(function() {
            Route::get("/", [AdminController::class, "getUsers"])->middleware("admin");
            Route::post("/", [AdminController::class, "createUser"])->middleware("admin");
        });

        Route::prefix("user")->group(function() {
            Route::put("/{id}", [AdminController::class, "updateUser"])->middleware("admin");
            Route::delete("/{id}", [AdminController::class, "deleteUser"])->middleware("admin");
        });

        Route::prefix("pool")->group(function() {
            Route::get('./', [PollController::class, 'getAllPool']);
            Route::post('/', [PollController::class, 'createPool'])->middleware("admin");
            Route::delete('/{id}', [PollController::class, 'deletePool'])->middleware("admin");
            Route::get('/{id}', [PollController::class, 'poolDetail']);
            
            Route::get('/{id}/result', [PollController::class, 'poolResult']);
            Route::post('/{id}/vote', [PollController::class, 'addVote'])->middleware("user");
        });

        Route::prefix("divisions")->group(function() {
            Route::get("/", [DivisionController::class, "index"]);
        });
    });
});

