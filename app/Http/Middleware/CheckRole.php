<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Vérification basique de l'authentification
        if (!$request->user()) {
            \Log::error('CheckRole: No user found');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        \Log::info('CheckRole debugging', [
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'required_role' => $role
        ]);

        // Charge explicitement les relations
        $user = $request->user()->load('roles');
        
        \Log::info('User roles loaded', [
            'roles' => $user->roles->pluck('name')->toArray()
        ]);

        // Vérifie si l'utilisateur a le rôle
        $hasRole = $user->roles->contains('name', $role);
        
        \Log::info('Role check result', [
            'has_role' => $hasRole
        ]);

        if (!$hasRole) {
            return response()->json([
                'message' => 'Unauthorized. Required role: ' . $role,
                'your_roles' => $user->roles->pluck('name')
            ], 403);
        }

        \Log::info('CheckRole passed');
        return $next($request);
    }
}