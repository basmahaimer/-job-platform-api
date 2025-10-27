<?php

/**
 * @OA\Info(
 *     title="Job Platform API",
 *     version="1.0.0",
 *     description="API complète pour la plateforme d'emploi - Authentification, gestion des offres et candidatures",
 *     @OA\Contact(
 *         email="support@jobplatform.com",
 *         name="Support Technique"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Serveur de développement local"
 * )
 * 
 * @OA\Server(
 *     url="https://api.jobplatform.com",
 *     description="Serveur de production"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Utilisez le token JWT reçu lors de l'authentification"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="Endpoints d'authentification et gestion des utilisateurs"
 * )
 * 
 * @OA\Tag(
 *     name="Jobs", 
 *     description="Endpoints de gestion des offres d'emploi"
 * )
 * 
 * @OA\Tag(
 *     name="Applications",
 *     description="Endpoints de gestion des candidatures"
 * )
 * 
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@test.com"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T12:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T12:00:00.000000Z")
 * )
 * 
 * @OA\Schema(
 *     schema="ValidationError",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="The given data was invalid."),
 *     @OA\Property(property="errors", type="object")
 * )
 * 
 * @OA\Schema(
 *     schema="DeleteResponse",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Resource deleted successfully")
 * )
 */