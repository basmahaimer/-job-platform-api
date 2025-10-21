<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // RELATION AVEC LES RÔLES
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    // METHODE POUR VERIFIER UN ROLE
    public function hasRole($roleName)
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    // Les offres postées par un employeur
    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    // Les candidatures d'un candidat
    public function applications()
    {
        return $this->hasMany(Application::class);
    }
} 