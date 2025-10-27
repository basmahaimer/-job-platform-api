<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Jobs",
 *     description="Endpoints de gestion des offres d'emploi"
 * )
 * 
 * @OA\Schema(
 *     schema="Job",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="Développeur Full-Stack"),
 *     @OA\Property(property="description", type="string", example="Nous recherchons un développeur full-stack expérimenté..."),
 *     @OA\Property(property="company", type="string", example="Tech Solutions"),
 *     @OA\Property(property="location", type="string", example="Paris"),
 *     @OA\Property(property="salary", type="number", format="float", example=50000.00),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="employer", ref="#/components/schemas/User")
 * )
 * 
 * @OA\Schema(
 *     schema="JobRequest",
 *     type="object",
 *     required={"title", "description", "company", "location"},
 *     @OA\Property(property="title", type="string", maxLength=255, example="Développeur Full-Stack"),
 *     @OA\Property(property="description", type="string", example="Description du poste..."),
 *     @OA\Property(property="company", type="string", maxLength=255, example="Tech Solutions"),
 *     @OA\Property(property="location", type="string", maxLength=255, example="Paris"),
 *     @OA\Property(property="salary", type="number", format="float", nullable=true, example=50000)
 * )
 * 
 * @OA\Schema(
 *     schema="JobUpdateRequest",
 *     type="object",
 *     @OA\Property(property="title", type="string", maxLength=255, example="Développeur Full-Stack Senior"),
 *     @OA\Property(property="description", type="string", example="Nouvelle description..."),
 *     @OA\Property(property="company", type="string", maxLength=255, example="Tech Solutions SAS"),
 *     @OA\Property(property="location", type="string", maxLength=255, example="Lyon"),
 *     @OA\Property(property="salary", type="number", format="float", nullable=true, example=55000),
 *     @OA\Property(property="is_active", type="boolean", example=true)
 * )
 * 
 * @OA\Schema(
 *     schema="JobListResponse",
 *     type="array",
 *     @OA\Items(ref="#/components/schemas/Job")
 * )
 * 
 * @OA\Schema(
 *     schema="DeleteResponse",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Job deleted successfully")
 * )
 */
class JobController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/jobs",
     *     summary="Liste toutes les offres d'emploi actives",
     *     description="Retourne la liste de toutes les offres d'emploi actives avec les informations de l'employeur",
     *     tags={"Jobs"},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des offres d'emploi",
     *         @OA\JsonContent(ref="#/components/schemas/JobListResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erreur serveur"
     *     )
     * )
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
     * @OA\Post(
     *     path="/api/jobs",
     *     summary="Créer une nouvelle offre d'emploi",
     *     description="Crée une nouvelle offre d'emploi (réservé aux employeurs)",
     *     tags={"Jobs"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Données de l'offre d'emploi",
     *         @OA\JsonContent(ref="#/components/schemas/JobRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Offre créée avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/Job")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé - rôle employeur requis",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized. Employer role required.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/jobs/{id}",
     *     summary="Afficher une offre spécifique",
     *     description="Retourne les détails d'une offre d'emploi spécifique",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'offre d'emploi",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Détails de l'offre",
     *         @OA\JsonContent(ref="#/components/schemas/Job")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Offre non trouvée"
     *     )
     * )
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
     * @OA\Put(
     *     path="/api/jobs/{id}",
     *     summary="Mettre à jour une offre d'emploi",
     *     description="Met à jour une offre d'emploi existante (propriétaire ou admin seulement)",
     *     tags={"Jobs"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'offre à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Données à mettre à jour",
     *         @OA\JsonContent(ref="#/components/schemas/JobUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Offre mise à jour",
     *         @OA\JsonContent(ref="#/components/schemas/Job")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé"
     *     )
     * )
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
     * @OA\Delete(
     *     path="/api/jobs/{id}",
     *     summary="Supprimer une offre d'emploi",
     *     description="Supprime une offre d'emploi (propriétaire ou admin seulement)",
     *     tags={"Jobs"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'offre à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Offre supprimée",
     *         @OA\JsonContent(ref="#/components/schemas/DeleteResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/jobs/search",
     *     summary="Recherche d'offres d'emploi",
     *     description="Recherche des offres d'emploi par titre, entreprise ou localisation",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="title",
     *         in="query",
     *         required=false,
     *         description="Terme de recherche dans le titre",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="company",
     *         in="query",
     *         required=false,
     *         description="Terme de recherche dans l'entreprise",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="location",
     *         in="query",
     *         required=false,
     *         description="Terme de recherche dans la localisation",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Résultats de la recherche",
     *         @OA\JsonContent(ref="#/components/schemas/JobListResponse")
     *     )
     * )
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