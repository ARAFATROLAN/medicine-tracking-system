<?php
// Direct database fix script to add specialisation column
try {
    // Try localhost first (common for local MySQL)
    try {
        $pdo = new PDO("mysql:host=localhost;dbname=medicine_tracking", "root", "root123");
    } catch (Exception $e) {
        // Try with different password
        $pdo = new PDO("mysql:host=localhost;dbname=medicine_tracking", "root", "root");
    }
    
    echo "Connected to database successfully\n";
    
    // Check if specialisation column exists
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hasSpecialisation = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'specialisation') {
            $hasSpecialisation = true;
            break;
        }
    }
    
    if (!$hasSpecialisation) {
        echo "Adding specialisation column to users table...\n";
        
        // Find the contact column index to add after it
        $sql = "ALTER TABLE users ADD COLUMN specialisation VARCHAR(255) NOT NULL DEFAULT 'Doctor' AFTER contact";
        $pdo->exec($sql);
        
        echo "✓ specialisation column added successfully!\n";
    } else {
        echo "✓ specialisation column already exists!\n";
    }
    
    // Verify the column was added
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nCurrent users table structure:\n";
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
