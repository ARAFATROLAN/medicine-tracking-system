<?php
try {
    $pdo = new PDO("mysql:host=db;dbname=medicine_tracking", "root", "root");
    echo "Connected\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Users count: " . $count . "\n";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
