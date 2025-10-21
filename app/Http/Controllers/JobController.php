<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    /**
     * Liste toutes les offres d'emploi actives
     */
    public function index()
    {
        try {
            $jobs = Job::with('employer:id,name')
                       ->where('is_active', true)
                       ->latest()
                       ->get();
            
            return response()->json($jobs);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Créer une nouvelle offre d'emploi
     */
    public function store(Request $request)
    {
        try {
            // Vérification du rôle employeur
            $userRoles = Auth::user()->roles()->pluck('name')->toArray();
            if (!in_array('employer', $userRoles)) {
                return response()->json(['message' => 'Unauthorized. Employer role required.'], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'company' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'salary' => 'nullable|numeric',
            ]);

            $job = Job::create([
                ...$validated,
                'user_id' => Auth::id()
            ]);

            return response()->json($job, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Afficher une offre spécifique
     */
    public function show(Job $job)
    {
        try {
            $job->load('employer:id,name');
            return response()->json($job);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mettre à jour une offre
     */
    public function update(Request $request, Job $job)
    {
        try {
            $userRoles = Auth::user()->roles()->pluck('name')->toArray();
            
            // Seul l'employeur propriétaire ou admin peut modifier
            if (Auth::id() !== $job->user_id && !in_array('admin', $userRoles)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'company' => 'sometimes|string|max:255',
                'location' => 'sometimes|string|max:255',
                'salary' => 'nullable|numeric',
                'is_active' => 'sometimes|boolean'
            ]);

            $job->update($validated);

            return response()->json($job);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer une offre
     */
    public function destroy(Job $job)
    {
        try {
            $userRoles = Auth::user()->roles()->pluck('name')->toArray();
            
            // Seul l'employeur propriétaire ou admin peut supprimer
            if (Auth::id() !== $job->user_id && !in_array('admin', $userRoles)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $job->delete();

            return response()->json(['message' => 'Job deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Recherche d'offres d'emploi
     */
    public function search(Request $request)
    {
        try {
            $query = Job::with('employer:id,name')->where('is_active', true);

            if ($request->has('title') && $request->title) {
                $query->where('title', 'like', '%' . $request->title . '%');
            }

            if ($request->has('company') && $request->company) {
                $query->where('company', 'like', '%' . $request->company . '%');
            }

            if ($request->has('location') && $request->location) {
                $query->where('location', 'like', '%' . $request->location . '%');
            }

            $jobs = $query->latest()->get();

            return response()->json($jobs);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}