<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $roles = ['admin', 'doctor', 'pharmacist'];
        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r]);
        }

        // Create test users
        $users = [
            ['name' => 'Admin User', 'email' => 'admin@example.com', 'role' => 'admin'],
            ['name' => 'Doctor User', 'email' => 'doctor@example.com', 'role' => 'doctor'],
            ['name' => 'Pharmacist User', 'email' => 'pharmacist@example.com', 'role' => 'pharmacist'],
        ];

        foreach ($users as $u) {
            $user = User::firstOrCreate(
                ['email' => $u['email']],
                ['name' => $u['name'], 'password' => Hash::make('password')]
            );

            $role = Role::where('name', $u['role'])->first();
            if ($role) {
                DB::table('user_roles')->updateOrInsert(
                    ['user_id' => $user->id, 'role_id' => $role->id],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }
}
