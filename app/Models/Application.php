<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'cover_letter',
        'status',
        'user_id',
        'job_id'
    ];

    // Le candidat qui a postulé
    public function candidate()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // L'offre d'emploi
    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}