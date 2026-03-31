<?php
// Get database connection and create a token
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\DB;

try {
    // Get or create test user
    $user = User::firstOrCreate(
        ['email' => 'test@example.com'],
        [
            'name' => 'Test Admin',
            'password' => bcrypt('password123'),
            'contact' => '123-456-7890',
        ]
    );

    // Create a token
    $token = $user->createToken('test-token')->plainTextToken;

    echo "Token created successfully!\n";
    echo "User ID: " . $user->id . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Token: " . $token . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
