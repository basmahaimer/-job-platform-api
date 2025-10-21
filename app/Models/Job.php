<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $table = 'job_offers';

    protected $fillable = [
        'title',
        'description',
        'company',
        'location',
        'salary',
        'user_id',
        'is_active'
    ];

    // L'employeur qui a posté l'offre
    public function employer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Les candidatures pour cette offre
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    // Scope pour les offres actives
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}