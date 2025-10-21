<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    /**
     * Liste toutes les candidatures selon le rôle
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $user->load('roles'); // Charge les relations de rôle
            
            $userRoles = $user->roles->pluck('name')->toArray();

            if (in_array('candidate', $userRoles)) {
                // Candidat : voit ses propres candidatures
                $applications = Application::with(['job.employer:id,name', 'job:id,title,company'])
                    ->where('user_id', $user->id)
                    ->latest()
                    ->get();
                    
                return response()->json([
                    'role' => 'candidate',
                    'applications' => $applications
                ]);
                
            } elseif (in_array('employer', $userRoles)) {
                // Employeur : voit les candidatures pour ses offres
                $applications = Application::with(['candidate:id,name,email', 'job:id,title'])
                    ->whereHas('job', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->latest()
                    ->get();
                    
                return response()->json([
                    'role' => 'employer', 
                    'applications' => $applications
                ]);
                
            } elseif (in_array('admin', $userRoles)) {
                // Admin : voit toutes les candidatures
                $applications = Application::with(['candidate:id,name,email', 'job.employer:id,name', 'job:id,title'])
                    ->latest()
                    ->get();
                    
                return response()->json([
                    'role' => 'admin',
                    'applications' => $applications
                ]);
            }

            return response()->json(['message' => 'Unauthorized role'], 403);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Postuler à une offre d'emploi
     */
    public function store(Request $request, Job $job)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

            // Seuls les candidats peuvent postuler
            if (!in_array('candidate', $userRoles)) {
                return response()->json([
                    'message' => 'Unauthorized. Candidate role required.'
                ], 403);
            }

            // Vérifier si l'offre est active
            if (!$job->is_active) {
                return response()->json([
                    'message' => 'This job is no longer available'
                ], 400);
            }

            // Vérifier si déjà postulé
            $existingApplication = Application::where('user_id', $user->id)
                ->where('job_id', $job->id)
                ->first();

            if ($existingApplication) {
                return response()->json([
                    'message' => 'You have already applied to this job',
                    'application_id' => $existingApplication->id
                ], 409);
            }

            $validated = $request->validate([
                'cover_letter' => 'nullable|string|max:1000',
            ]);

            $application = Application::create([
                'cover_letter' => $validated['cover_letter'] ?? null,
                'user_id' => $user->id,
                'job_id' => $job->id,
                'status' => 'pending'
            ]);

            // Charger les relations pour la réponse
            $application->load('job.employer:id,name', 'candidate:id,name');

            return response()->json([
                'message' => 'Application submitted successfully',
                'application' => $application
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'une candidature (employeur/admin seulement)
     */
    public function update(Request $request, Application $application)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

            // Vérifier les permissions
            $isEmployerOwner = $application->job->user_id === $user->id;
            $isAdmin = in_array('admin', $userRoles);

            if (!$isEmployerOwner && !$isAdmin) {
                return response()->json([
                    'message' => 'Unauthorized. Only job owner or admin can update applications.'
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|in:pending,accepted,rejected',
            ]);

            $application->update([
                'status' => $validated['status']
            ]);

            // Recharger les relations
            $application->load('candidate:id,name,email', 'job.employer:id,name');

            return response()->json([
                'message' => 'Application status updated successfully',
                'application' => $application
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Supprimer une candidature
     */
    public function destroy(Application $application)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

            // Vérifier les permissions
            $isCandidateOwner = $application->user_id === $user->id;
            $isEmployerOwner = $application->job->user_id === $user->id;
            $isAdmin = in_array('admin', $userRoles);

            if (!$isCandidateOwner && !$isEmployerOwner && !$isAdmin) {
                return response()->json([
                    'message' => 'Unauthorized. Only application owner, job owner or admin can delete.'
                ], 403);
            }

            $application->delete();

            return response()->json([
                'message' => 'Application deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Voir une candidature spécifique
     */
    public function show(Application $application)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

            // Vérifier les permissions
            $isCandidateOwner = $application->user_id === $user->id;
            $isEmployerOwner = $application->job->user_id === $user->id;
            $isAdmin = in_array('admin', $userRoles);

            if (!$isCandidateOwner && !$isEmployerOwner && !$isAdmin) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Charger les relations selon le rôle
            if ($isCandidateOwner) {
                $application->load('job.employer:id,name', 'job:id,title,company,location');
            } else {
                $application->load('candidate:id,name,email', 'job.employer:id,name', 'job:id,title');
            }

            return response()->json([
                'application' => $application
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}