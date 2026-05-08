<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Assign roles to users based on their specialisation field
     */
    public function up(): void
    {
        // Ensure all roles exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $doctorRole = Role::firstOrCreate(['name' => 'doctor']);
        $pharmacistRole = Role::firstOrCreate(['name' => 'pharmacist']);

        // Get all users without roles
        $usersWithoutRoles = User::doesntHave('roles')->get();

        foreach ($usersWithoutRoles as $user) {
            $specialisation = strtolower($user->specialisation ?? 'doctor');

            $roleId = match ($specialisation) {
                'admin' => $adminRole->id,
                'pharmacist' => $pharmacistRole->id,
                default => $doctorRole->id,
            };

            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $roleId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is data-fixing and shouldn't be reversed
        // But if needed, we could delete roles assigned by this migration
    }
};
