<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Applications",
 *     description="Endpoints de gestion des candidatures"
 * )
 * 
 * @OA\Schema(
 *     schema="Application",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="cover_letter", type="string", example="Je suis très intéressé par ce poste..."),
 *     @OA\Property(property="status", type="string", enum={"pending", "accepted", "rejected"}, example="pending"),
 *     @OA\Property(property="user_id", type="integer", example=2),
 *     @OA\Property(property="job_id", type="integer", example=1),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="candidate", ref="#/components/schemas/User"),
 *     @OA\Property(property="job", ref="#/components/schemas/Job")
 * )
 * 
 * @OA\Schema(
 *     schema="ApplicationRequest",
 *     type="object",
 *     @OA\Property(property="cover_letter", type="string", maxLength=1000, nullable=true, example="Lettre de motivation...")
 * )
 * 
 * @OA\Schema(
 *     schema="ApplicationUpdateRequest",
 *     type="object",
 *     required={"status"},
 *     @OA\Property(property="status", type="string", enum={"pending", "accepted", "rejected"}, example="accepted")
 * )
 * 
 * @OA\Schema(
 *     schema="ApplicationResponse",
 *     type="object",
 *     @OA\Property(property="role", type="string", example="candidate"),
 *     @OA\Property(property="applications", type="array", @OA\Items(ref="#/components/schemas/Application"))
 * )
 * 
 * @OA\Schema(
 *     schema="ApplicationSuccessResponse",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Application submitted successfully"),
 *     @OA\Property(property="application", ref="#/components/schemas/Application")
 * )
 * 
 * @OA\Schema(
 *     schema="ApplicationUpdateResponse",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Application status updated successfully"),
 *     @OA\Property(property="application", ref="#/components/schemas/Application")
 * )
 */
class ApplicationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/applications",
     *     summary="Lister les candidatures",
     *     description="Retourne les candidatures selon le rôle de l'utilisateur",
     *     tags={"Applications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des candidatures",
     *         @OA\JsonContent(ref="#/components/schemas/ApplicationResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Rôle non autorisé"
     *     )
     * )
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $user->load('roles');
            
            $userRoles = $user->roles->pluck('name')->toArray();

            if (in_array('candidate', $userRoles)) {
                $applications = Application::with(['job.employer:id,name', 'job:id,title,company'])
                    ->where('user_id', $user->id)
                    ->latest()
                    ->get();
                    
                return response()->json([
                    'role' => 'candidate',
                    'applications' => $applications
                ]);
                
            } elseif (in_array('employer', $userRoles)) {
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
     * @OA\Post(
     *     path="/api/jobs/{id}/apply",
     *     summary="Postuler à une offre d'emploi",
     *     description="Soumet une candidature pour une offre d'emploi (candidats seulement)",
     *     tags={"Applications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'offre d'emploi",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Données de la candidature",
     *         @OA\JsonContent(ref="#/components/schemas/ApplicationRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Candidature soumise",
     *         @OA\JsonContent(ref="#/components/schemas/ApplicationSuccessResponse")
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Offre non disponible"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Rôle candidat requis"
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="Déjà postulé"
     *     )
     * )
     */
    public function store(Request $request, Job $job)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

            if (!in_array('candidate', $userRoles)) {
                return response()->json([
                    'message' => 'Unauthorized. Candidate role required.'
                ], 403);
            }

            if (!$job->is_active) {
                return response()->json([
                    'message' => 'This job is no longer available'
                ], 400);
            }

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
     * @OA\Put(
     *     path="/api/applications/{id}",
     *     summary="Mettre à jour le statut d'une candidature",
     *     description="Met à jour le statut d'une candidature (employeur ou admin seulement)",
     *     tags={"Applications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la candidature",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Nouveau statut",
     *         @OA\JsonContent(ref="#/components/schemas/ApplicationUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Statut mis à jour",
     *         @OA\JsonContent(ref="#/components/schemas/ApplicationUpdateResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Non autorisé"
     *     )
     * )
     */
    public function update(Request $request, Application $application)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

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
     * @OA\Delete(
     *     path="/api/applications/{id}",
     *     summary="Supprimer une candidature",
     *     description="Supprime une candidature (candidat, employeur ou admin)",
     *     tags={"Applications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la candidature",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Candidature supprimée",
     *         @OA\JsonContent(ref="#/components/schemas/DeleteResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Non autorisé"
     *     )
     * )
     */
    public function destroy(Application $application)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

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
     * @OA\Get(
     *     path="/api/applications/{id}",
     *     summary="Voir une candidature spécifique",
     *     description="Affiche les détails d'une candidature spécifique",
     *     tags={"Applications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la candidature",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Détails de la candidature",
     *         @OA\JsonContent(
     *             @OA\Property(property="application", ref="#/components/schemas/Application")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Non autorisé"
     *     )
     * )
     */
    public function show(Application $application)
    {
        try {
            $user = Auth::user();
            $userRoles = $user->roles()->pluck('name')->toArray();

            $isCandidateOwner = $application->user_id === $user->id;
            $isEmployerOwner = $application->job->user_id === $user->id;
            $isAdmin = in_array('admin', $userRoles);

            if (!$isCandidateOwner && !$isEmployerOwner && !$isAdmin) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

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