<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Création des rôles
        $roles = ['candidate', 'employer', 'admin'];
        
        foreach ($roles as $role) {
            Role::create(['name' => $role]);
        }

        // Création d'un admin par défaut
        $adminUser = User::create([
            'name' => 'Administrateur',
            'email' => 'admin@jobplatform.com',
            'password' => Hash::make('admin123'),
        ]);

        // Attribution du rôle admin
        $adminRole = Role::where('name', 'admin')->first();
        $adminUser->roles()->attach($adminRole);

        $this->command->info('Admin créé : admin@jobplatform.com / admin123');
    }
}