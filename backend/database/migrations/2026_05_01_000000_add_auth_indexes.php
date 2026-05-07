<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add indexes for authentication performance optimization
     */
    public function up(): void
    {
        // Add composite index on user_roles for faster role lookups
        DB::statement('CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id)');
        
        // Add index on specialisation for faster user type queries
        DB::statement('CREATE INDEX IF NOT EXISTS idx_users_specialisation ON users (specialisation)');
        
        // Add index on roles name for faster role lookups
        DB::statement('CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (name)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_user_roles_user_id');
        DB::statement('DROP INDEX IF EXISTS idx_users_specialisation');
        DB::statement('DROP INDEX IF EXISTS idx_roles_name');
    }
};