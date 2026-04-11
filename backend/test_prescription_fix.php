<?php

// Test prescription creation after migration fix
$ch = curl_init();

// First, get a doctor's token (assuming user ID 2 is a doctor)
// If you need to login first, uncomment the login section below

// For this test, we'll use a hardcoded token from localStorage or environment
// You can get this by logging in and checking localStorage

$token = getenv('TEST_TOKEN') ?? 'your-bearer-token-here';

// Test data
$testData = [
    'patient_id' => 1, // Adjust based on actual patient ID in database
    'medicines' => [
        [
            'id' => 1, // Adjust based on actual medicine ID
            'quantity' => 10,
            'dosage' => '2 tablets twice daily'
        ]
    ],
    'notes' => 'Test prescription for verification'
];

// Make the API request
curl_setopt_array($ch, [
    CURLOPT_URL => 'http://medicine_app:8000/api/v1/prescriptions',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ],
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => json_encode($testData)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "HTTP Status: " . $httpCode . "\n";
echo "Response:\n";
echo json_encode(json_decode($response, true), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";

if ($error) {
    echo "Error: " . $error . "\n";
}

// Expected success response:
// HTTP Status: 201
// Response: {"message":"Prescription created successfully","prescription":{...}}
?>
