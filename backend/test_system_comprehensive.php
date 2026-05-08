<?php

/**
 * Comprehensive System Test Script
 * Tests all critical components of the Medicine Tracking System
 */

echo "=" . str_repeat("=", 78) . "\n";
echo "MEDICINE TRACKING SYSTEM - COMPREHENSIVE DIAGNOSTIC TEST\n";
echo "=" . str_repeat("=", 78) . "\n\n";

// Bootstrap Laravel Application
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test 1: Database Connection
echo "[TEST 1] Database Connection\n";
echo str_repeat("-", 80) . "\n";
try {
    $db = \Illuminate\Support\Facades\DB::connection();
    $result = $db->select('SELECT COUNT(*) as count FROM users');
    echo "✓ Database connected successfully\n";
    echo "  Users in database: " . $result[0]->count . "\n";
} catch (Exception $e) {
    echo "✗ Database connection failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 2: Environment Variables
echo "[TEST 2] Environment Variables\n";
echo str_repeat("-", 80) . "\n";
echo "DB_HOST: " . config('database.connections.mysql.host') . "\n";
echo "DB_PORT: " . config('database.connections.mysql.port') . "\n";
echo "DB_DATABASE: " . config('database.connections.mysql.database') . "\n";
echo "DB_USERNAME: " . config('database.connections.mysql.username') . "\n";
echo "APP_ENV: " . config('app.env') . "\n";
echo "\n";

// Test 3: Models & Tables
echo "[TEST 3] Database Tables\n";
echo str_repeat("-", 80) . "\n";
try {
    $tables = $db->select("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . config('database.connections.mysql.database') . "'");
    echo "✓ Tables found: " . count($tables) . "\n";
    foreach ($tables as $table) {
        echo "  - " . $table->TABLE_NAME . "\n";
    }
} catch (Exception $e) {
    echo "✗ Failed to list tables\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 4: User Model
echo "[TEST 4] User Model\n";
echo str_repeat("-", 80) . "\n";
try {
    $userModel = new \App\Models\User();
    echo "✓ User model loaded successfully\n";
    echo "  Table: " . $userModel->getTable() . "\n";
    $userCount = $userModel->count();
    echo "  Users in table: " . $userCount . "\n";
} catch (Exception $e) {
    echo "✗ User model failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 5: Role Model
echo "[TEST 5] Role Model\n";
echo str_repeat("-", 80) . "\n";
try {
    $roleModel = new \App\Models\Role();
    echo "✓ Role model loaded successfully\n";
    $roles = $roleModel->all();
    echo "  Roles in database: " . count($roles) . "\n";
    foreach ($roles as $role) {
        echo "    - " . $role->name . "\n";
    }
} catch (Exception $e) {
    echo "✗ Role model failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 6: User-Role Relationships
echo "[TEST 6] User-Role Relationships\n";
echo str_repeat("-", 80) . "\n";
try {
    $users = \App\Models\User::with('roles')->limit(5)->get();
    echo "✓ User relationships loaded\n";
    echo "  Sample users with roles:\n";
    foreach ($users as $user) {
        $roleNames = $user->roles->pluck('name')->toArray();
        echo "    - " . $user->email . ": [" . implode(', ', $roleNames) . "]\n";
    }
} catch (Exception $e) {
    echo "✗ Relationship loading failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 7: Test Email Uniqueness Validation
echo "[TEST 7] Email Uniqueness Check\n";
echo str_repeat("-", 80) . "\n";
try {
    $testEmail = 'bughunter@gmail.com';
    $user = \App\Models\User::where('email', $testEmail)->first();
    if ($user) {
        echo "✓ Test email found in database\n";
        echo "  Email: " . $user->email . "\n";
        echo "  Name: " . $user->name . "\n";
    } else {
        echo "✓ Test email not found (safe to register)\n";
    }
} catch (Exception $e) {
    echo "✗ Email check failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 8: Migrations Status
echo "[TEST 8] Migrations\n";
echo str_repeat("-", 80) . "\n";
try {
    $migrations = $db->select("SELECT * FROM migrations ORDER BY batch DESC LIMIT 5");
    echo "✓ " . count($migrations) . " migrations executed\n";
    echo "  Latest migrations:\n";
    foreach(array_slice($migrations, 0, 3) as $migration) {
        echo "    - " . $migration->migration . " (batch " . $migration->batch . ")\n";
    }
} catch (Exception $e) {
    echo "✗ Migration check failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 9: Auth Sanctum
echo "[TEST 9] Sanctum API Auth\n";
echo str_repeat("-", 80) . "\n";
try {
    $tokenTable = $db->select("SELECT COUNT(*) as count FROM personal_access_tokens");
    echo "✓ Sanctum table exists\n";
    echo "  Tokens in database: " . $tokenTable[0]->count . "\n";
} catch (Exception $e) {
    echo "✗ Sanctum check failed\n";
    echo "  Error: " . $e->getMessage() . "\n";
}
echo "\n";

echo "=" . str_repeat("=", 78) . "\n";
echo "DIAGNOSTIC TEST COMPLETE\n";
echo "=" . str_repeat("=", 78) . "\n";
?>
