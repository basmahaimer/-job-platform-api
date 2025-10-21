<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ApplicationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'API works!']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes publiques pour les jobs
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/search', [JobController::class, 'search']);
Route::get('/jobs/{job}', [JobController::class, 'show']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/test-auth', function (Request $request) {
        return response()->json([
            'message' => 'Authenticated!',
            'user' => $request->user()->name,
            'roles' => $request->user()->roles->pluck('name')
        ]);
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Routes jobs protégées
    Route::post('/jobs', [JobController::class, 'store']);
    Route::put('/jobs/{job}', [JobController::class, 'update']);
    Route::delete('/jobs/{job}', [JobController::class, 'destroy']);
    
    // Route admin avec vérification manuelle
    Route::get('/admin-only', function (Request $request) {
        $userRoles = $request->user()->roles()->pluck('name')->toArray();
        
        if (!in_array('admin', $userRoles)) {
            return response()->json(['message' => 'Admin access required'], 403);
        }
        
        return response()->json(['message' => 'Admin access granted!']);
    });

    // Routes pour les candidatures
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::post('/jobs/{job}/apply', [ApplicationController::class, 'store']);
    Route::put('/applications/{application}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy']);
});