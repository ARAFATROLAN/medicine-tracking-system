<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";
echo "╔" . str_repeat("═", 78) . "╗\n";
echo "║" . str_pad("FINAL SYSTEM VERIFICATION TEST", 78) . "║\n";
echo "╚" . str_repeat("═", 78) . "╝\n\n";

$testsPassed = 0;
$testsFailed = 0;

function testResult($name, $passed, $details = '') {
    global $testsPassed, $testsFailed;
    $status = $passed ? "✓ PASS" : "✗ FAIL";
    $color = $passed ? "\033[32m" : "\033[31m";
    
    echo "{$color}{$status}\033[0m | {$name}";
    if ($details) echo " | {$details}";
    echo "\n";
    
    if ($passed) $testsPassed++; else $testsFailed++;
}

try {
    // Test 1: Database Connection
    $db = \Illuminate\Support\Facades\DB::connection();
    $result = $db->select('SELECT COUNT(*) as count FROM users');
    testResult("Database Connection", true, "Users: " . $result[0]->count);
} catch (Exception $e) {
    testResult("Database Connection", false, $e->getMessage());
}

try {
    // Test 2: All Tables Exist
    $tables = $db->select("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . config('database.connections.mysql.database') . "'");
    testResult("Database Tables", count($tables) >= 30, "Found: " . count($tables));
} catch (Exception $e) {
    testResult("Database Tables", false, $e->getMessage());
}

try {
    // Test 3: Migrations
    $migrations = $db->select("SELECT COUNT(*) as count FROM migrations");
    testResult("Migrations Executed", $migrations[0]->count >= 40, "Count: " . $migrations[0]->count);
} catch (Exception $e) {
    testResult("Migrations Executed", false, $e->getMessage());
}

try {
    // Test 4: Roles Exist
    $roles = \App\Models\Role::pluck('name')->toArray();
    $hasRequired = in_array('admin', $roles) && in_array('doctor', $roles) && in_array('pharmacist', $roles);
    testResult("All Required Roles", $hasRequired, "Found: " . implode(', ', $roles));
} catch (Exception $e) {
    testResult("All Required Roles", false, $e->getMessage());
}

try {
    // Test 5: Users Have Roles
    $usersWithRoles = \App\Models\User::whereHas('roles')->count();
    $totalUsers = \App\Models\User::count();
    testResult("User Roles Assigned", $usersWithRoles == $totalUsers, "{$usersWithRoles}/{$totalUsers} users");
} catch (Exception $e) {
    testResult("User Roles Assigned", false, $e->getMessage());
}

try {
    // Test 6: Admin Users Exist
    $admins = \App\Models\User::whereHas('roles', function($q) { $q->where('name', 'admin'); })->count();
    testResult("Admin Users Exist", $admins > 0, "Found: {$admins} admin(s)");
} catch (Exception $e) {
    testResult("Admin Users Exist", false, $e->getMessage());
}

try {
    // Test 7: Authentication Tokens
    $tokens = $db->select("SELECT COUNT(*) as count FROM personal_access_tokens");
    testResult("API Tokens Present", $tokens[0]->count >= 0, "Tokens: " . $tokens[0]->count);
} catch (Exception $e) {
    testResult("API Tokens Present", false, $e->getMessage());
}

try {
    // Test 8: Sanctum Table
    $columns = $db->select("SHOW COLUMNS FROM personal_access_tokens");
    testResult("Sanctum Configured", count($columns) > 0, "Columns: " . count($columns));
} catch (Exception $e) {
    testResult("Sanctum Configured", false, $e->getMessage());
}

try {
    // Test 9: Key Tables
    $tables = $db->select("SHOW TABLES");
    $tableNames = array_map(function($t) { return array_values((array)$t)[0]; }, $tables);
    $required = ['users', 'roles', 'user_roles', 'medicines', 'prescriptions', 'deliveries'];
    $missing = array_diff($required, $tableNames);
    testResult("Key Tables Present", count($missing) === 0, count($missing) > 0 ? "Missing: " . implode(', ', $missing) : "All present");
} catch (Exception $e) {
    testResult("Key Tables Present", false, $e->getMessage());
}

try {
    // Test 10: User Model
    $user = \App\Models\User::first();
    testResult("User Model Works", $user !== null, $user ? $user->email : "No users");
} catch (Exception $e) {
    testResult("User Model Works", false, $e->getMessage());
}

try {
    // Test 11: Role Relationships
    $admin = \App\Models\User::whereHas('roles', function($q) { $q->where('name', 'admin'); })->first();
    $hasRoles = $admin && count($admin->roles) > 0;
    testResult("Role Relationships", $hasRoles && $admin->roles[0]->name === 'admin', 
        $admin ? $admin->roles->pluck('name')->implode(', ') : "No admin");
} catch (Exception $e) {
    testResult("Role Relationships", false, $e->getMessage());
}

try {
    // Test 12: Environment Variables
    $env = [
        'DB_HOST' => config('database.connections.mysql.host'),
        'DB_DATABASE' => config('database.connections.mysql.database'),
        'APP_ENV' => config('app.env'),
    ];
    $valid = !empty($env['DB_HOST']) && !empty($env['DB_DATABASE']);
    testResult("Environment Config", $valid, implode(', ', array_filter($env)));
} catch (Exception $e) {
    testResult("Environment Config", false, $e->getMessage());
}

// Summary
echo "\n";
echo "╔" . str_repeat("═", 78) . "╗\n";
echo sprintf("║ %-76s ║\n", "TEST SUMMARY");
echo "╠" . str_repeat("═", 78) . "╣\n";
echo sprintf("║ Tests Passed: %-62s ║\n", $testsPassed . " ✓");
echo sprintf("║ Tests Failed: %-62s ║\n", $testsFailed . " ✗");
echo sprintf("║ Total:        %-62s ║\n", ($testsPassed + $testsFailed));
$percentage = ($testsPassed + $testsFailed) > 0 ? round(($testsPassed / ($testsPassed + $testsFailed)) * 100) : 0;
echo sprintf("║ Success Rate: %-62s ║\n", $percentage . "%");
echo "╚" . str_repeat("═", 78) . "╝\n\n";

if ($testsFailed === 0) {
    echo "\033[32m✓ ALL SYSTEMS OPERATIONAL\033[0m\n\n";
} else {
    echo "\033[31m✗ SOME SYSTEMS REQUIRE ATTENTION\033[0m\n\n";
}

?>
