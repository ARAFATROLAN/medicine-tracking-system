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
        Schema::table('user_roles', function ($table) {
            $table->index('user_id');
        });
        
        // Add index on specialisation for faster user type queries
        Schema::table('users', function ($table) {
            $table->index('specialisation');
        });
        
        // Add index on roles name for faster role lookups
        Schema::table('roles', function ($table) {
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_roles', function ($table) {
            $table->dropIndex(['user_id']);
        });
        Schema::table('users', function ($table) {
            $table->dropIndex(['specialisation']);
        });
        Schema::table('roles', function ($table) {
            $table->dropIndex(['name']);
        });
    }
};