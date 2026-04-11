<?php
// Comprehensive test for prescription creation after pivot table fix
require 'vendor/autoload.php';

// Start with same container network access as the PHP app
$baseUrl = 'http://medicine_app:8000/api/v1';

function testPrescriptionCreation() {
    global $baseUrl;

    // Step 1: Login to get token
    echo "Step 1: Attempting login...\n";
    $loginResponse = file_get_contents(
        $baseUrl . '/login',
        false,
        stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode([
                    'email' => 'doctor@example.com',
                    'password' => 'password'
                ])
            ]
        ])
    );

    $loginData = json_decode($loginResponse, true);

    if (empty($loginData['access_token'])) {
        echo "❌ Login failed!\n";
        echo "Response: " . json_encode($loginData, JSON_PRETTY_PRINT) . "\n";
        return false;
    }

    $token = $loginData['access_token'];
    echo "✅ Login successful, token: " . substr($token, 0, 20) . "...\n";
    echo "   User: " . $loginData['user']['name'] . " (ID: " . $loginData['user']['id'] . ")\n";

    // Step 2: Get patients
    echo "\nStep 2: Fetching available patients...\n";
    $patientsResponse = file_get_contents(
        $baseUrl . '/patients',
        false,
        stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => 'Authorization: Bearer ' . $token . "\r\nAccept: application/json",
            ]
        ])
    );

    $patientsData = json_decode($patientsResponse, true);

    if (empty($patientsData['data'])) {
        echo "❌ No patients found!\n";
        return false;
    }

    $patientId = $patientsData['data'][0]['id'];
    $patientName = $patientsData['data'][0]['name'];
    echo "✅ Found " . count($patientsData['data']) . " patient(s)\n";
    echo "   Using: $patientName (ID: $patientId)\n";

    // Step 3: Get medicines
    echo "\nStep 3: Fetching available medicines...\n";
    $medicinesResponse = file_get_contents(
        $baseUrl . '/medicines',
        false,
        stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => 'Authorization: Bearer ' . $token . "\r\nAccept: application/json",
            ]
        ])
    );

    $medicinesData = json_decode($medicinesResponse, true);

    if (empty($medicinesData['data'])) {
        echo "❌ No medicines found!\n";
        return false;
    }

    $medicines = array_slice($medicinesData['data'], 0, 2); // Get up to 2 medicines
    echo "✅ Found " . count($medicinesData['data']) . " medicine(s)\n";
    echo "   Using: " . count($medicines) . " medicine(s) for prescription\n";
    foreach ($medicines as $med) {
        echo "      - {$med['name']} (ID: {$med['id']})\n";
    }

    // Step 4: Create prescription
    echo "\nStep 4: Creating prescription...\n";

    $prescriptionPayload = [
        'patient_id' => $patientId,
        'medicines' => array_map(function($med) {
            return [
                'id' => $med['id'],
                'quantity' => rand(1, 5),
                'dosage' => '1 tablet ' . implode(' or ', ['once', 'twice', 'thrice']) . ' daily'
            ];
        }, $medicines),
        'notes' => 'Test prescription created by automated script'
    ];

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nAuthorization: Bearer " . $token . "\r\nAccept: application/json",
            'content' => json_encode($prescriptionPayload)
        ]
    ]);

    $prescriptionResponse = @file_get_contents($baseUrl . '/prescriptions', false, $context);

    // Check HTTP response code
    if ($prescriptionResponse === false) {
        echo "❌ Prescription creation request failed!\n";
        echo "   Error: " . (isset($http_response_header[0]) ? $http_response_header[0] : 'Unknown error') . "\n";
        return false;
    }

    $prescriptionData = json_decode($prescriptionResponse, true);

    if (!isset($prescriptionData['status']) || !$prescriptionData['status']) {
        echo "❌ Prescription creation failed!\n";
        echo "   Response: " . json_encode($prescriptionData, JSON_PRETTY_PRINT) . "\n";
        return false;
    }

    echo "✅ Prescription created successfully!\n";
    echo "   Prescription ID: " . $prescriptionData['data']['id'] . "\n";
    echo "   Patient: $patientName\n";
    if (isset($prescriptionData['data']['medicines'])) {
        echo "   Medicines attached: " . count($prescriptionData['data']['medicines']) . "\n";
        foreach ($prescriptionData['data']['medicines'] as $med) {
            echo "      - {$med['name']}: {$med['quantity']} ({$med['dosage']})\n";
        }
    }

    return true;
}

// Run the test
echo "====================================\n";
echo "Prescription Creation Test\n";
echo "====================================\n";

if (testPrescriptionCreation()) {
    echo "\n✅ TEST PASSED! Prescription creation is working.\n";
} else {
    echo "\n❌ TEST FAILED! Check the errors above.\n";
}

echo "====================================\n";
?>
