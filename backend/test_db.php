<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=medicine_tracking", "root", "root123");
    echo "Connected\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Users count: " . $count . "\n";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
