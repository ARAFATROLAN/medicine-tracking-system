<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use  \App\Models\User;
use \App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "Testing Admin Registration...\n";
echo str_repeat("=", 80) . "\n\n";

try {
    // Check if admin role exists
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    echo "✓ Admin role exists/created\n";
    
    // Create new admin user
    $newAdmin = User::create([
        'name' => 'System Administrator',
        'email' => 'sysadmin@medicine.local',
        'password' => Hash::make('SecureAdminPass123!'),
        'contact' => '1-800-MEDICINE',
        'specialisation' => 'admin'
    ]);
    
    echo "✓ Admin user created:\n";
    echo "  - ID: " . $newAdmin->id . "\n";
    echo "  - Name: " . $newAdmin->name . "\n";
    echo "  - Email: " . $newAdmin->email . "\n";
    
    // Assign role
    DB::table('user_roles')->insert([
        'user_id' => $newAdmin->id,
        'role_id' => $adminRole->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✓ Admin role assigned\n";
    
    //  Create token
    $token = $newAdmin->createToken('auth_token');
    echo "✓ Authorization token created\n";
    echo "  - Token: " . substr($token->plainTextToken, 0, 20) . "...\n";
    
    // Get roles
    $roles = $newAdmin->roles()->pluck('name')->toArray();
    
    echo "\n✓ REGISTRATION SUCCESSFUL!\n";
    echo str_repeat("=", 80) . "\n";
    echo "\nResponse:\n";
    $response = [
        'message' => 'User registered successfully',
        'access_token' => $token->plainTextToken,
        'token_type' => 'Bearer',
        'user' => [
            'id' => $newAdmin->id,
            'name' => $newAdmin->name,
            'email' => $newAdmin->email,
            'specialisation' => $newAdmin->specialisation,
            'roles' => $roles,
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    echo "✗ Registration failed\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " (Line " . $e->getLine() . ")\n";
}

?>
