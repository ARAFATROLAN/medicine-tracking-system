<?php

/**
 * Medicine Seal System - API Testing Script (PHP Version)
 * 
 * Usage:
 * php test_seal_api.php <auth_token> [base_url]
 * 
 * Example:
 * php test_seal_api.php "your_sanctum_token_here"
 * php test_seal_api.php "your_sanctum_token_here" "http://localhost:8000"
 */

class SealSystemTester {
    private $baseUrl;
    private $authToken;
    private $lastSealCode;

    public function __construct($authToken, $baseUrl = 'http://localhost:8000') {
        $this->authToken = $authToken;
        $this->baseUrl = $baseUrl;
    }

    /**
     * Make API request
     */
    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . '/api/v1' . $endpoint;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->authToken,
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'status' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }

    /**
     * Test seal generation
     */
    public function testGenerateSeal() {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "TEST 1: Generate Seal\n";
        echo str_repeat("=", 60) . "\n";

        $response = $this->request('POST', '/seals/generate', [
            'medicine_id' => 1,
            'quantity' => 1,
            'batch_number' => 'BATCH-2026-04-TEST-' . time(),
            'location_generated' => 'Main Pharmacy'
        ]);

        echo "Status: " . $response['status'] . "\n";
        echo json_encode($response['data'], JSON_PRETTY_PRINT) . "\n";

        if ($response['data']['success'] && isset($response['data']['data']['seals'][0]['code'])) {
            $this->lastSealCode = $response['data']['data']['seals'][0]['code'];
            echo "\nSeal Code: " . $this->lastSealCode . "\n";
            return true;
        }

        return false;
    }

    /**
     * Test get seal details
     */
    public function testGetSealDetails() {
        if (!$this->lastSealCode) {
            echo "\nSkipping test: No seal code available\n";
            return false;
        }

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "TEST 2: Get Seal Details\n";
        echo str_repeat("=", 60) . "\n";

        $response = $this->request('GET', '/seals/' . $this->lastSealCode);

        echo "Status: " . $response['status'] . "\n";
        echo json_encode($response['data'], JSON_PRETTY_PRINT) . "\n";

        return $response['status'] === 200;
    }

    /**
     * Test get QR code
     */
    public function testGetQRCode() {
        if (!$this->lastSealCode) {
            echo "\nSkipping test: No seal code available\n";
            return false;
        }

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "TEST 3: Get QR Code\n";
        echo str_repeat("=", 60) . "\n";

        $response = $this->request('GET', '/seals/' . $this->lastSealCode . '/qr-code');

        echo "Status: " . $response['status'] . "\n";
        echo "Success: " . ($response['data']['success'] ? 'true' : 'false') . "\n";
        if ($response['data']['success']) {
            echo "QR Code URL: " . $response['data']['data']['qr_code_url'] . "\n";
        }

        return $response['status'] === 200;
    }

    /**
     * Test verify seal
     */
    public function testVerifySeal() {
        if (!$this->lastSealCode) {
            echo "\nSkipping test: No seal code available\n";
            return false;
        }

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "TEST 4: Verify Seal\n";
        echo str_repeat("=", 60) . "\n";

        $response = $this->request('POST', '/seals/verify', [
            'seal_code' => $this->lastSealCode,
            'location' => 'Pharmacy - Test Counter',
            'latitude' => 12.9716,
            'longitude' => 77.5946,
            'device_info' => 'PHP Test Client'
        ]);

        echo "Status: " . $response['status'] . "\n";
        echo "Verification Result:\n";
        echo json_encode($response['data'], JSON_PRETTY_PRINT) . "\n";

        return $response['data']['success'] ?? false;
    }

    /**
     * Test get audit trail
     */
    public function testGetAuditTrail() {
        if (!$this->lastSealCode) {
            echo "\nSkipping test: No seal code available\n";
            return false;
        }

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "TEST 5: Get Audit Trail\n";
        echo str_repeat("=", 60) . "\n";

        $response = $this->request('GET', '/seals/' . $this->lastSealCode . '/audit');

        echo "Status: " . $response['status'] . "\n";
        if ($response['data']['success']) {
            echo "Scan Count: " . $response['data']['data']['scan_count'] . "\n";
            echo "Seals Scanned: " . count($response['data']['data']['scans']) . "\n";
        }

        return $response['status'] === 200;
    }

    /**
     * Test bulk seal generation
     */
    public function testBulkGeneration() {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "TEST 6: Bulk Seal Generation\n";
        echo str_repeat("=", 60) . "\n";

        $response = $this->request('POST', '/seals/generate', [
            'medicine_id' => 1,
            'quantity' => 5,
            'batch_number' => 'BATCH-BULK-' . time(),
            'location_generated' => 'Main Pharmacy'
        ]);

        echo "Status: " . $response['status'] . "\n";
        echo "Total Generated: " . $response['data']['data']['total_generated'] . "\n";

        return $response['status'] === 201;
    }

    /**
     * Run all tests
     */
    public function runAll() {
        echo "\n";
        echo "╔" . str_repeat("═", 58) . "╗\n";
        echo "║" . str_repeat(" ", 58) . "║\n";
        echo "║  Medicine Seal System - API Testing Suite              ║\n";
        echo "║" . str_repeat(" ", 58) . "║\n";
        echo "╚" . str_repeat("═", 58) . "╝\n";
        echo "\nBase URL: " . $this->baseUrl . "\n";
        echo "Time: " . date('Y-m-d H:i:s') . "\n";

        $results = [];
        $results['Generate Seal'] = $this->testGenerateSeal();
        $results['Get Seal Details'] = $this->testGetSealDetails();
        $results['Get QR Code'] = $this->testGetQRCode();
        $results['Verify Seal'] = $this->testVerifySeal();
        $results['Get Audit Trail'] = $this->testGetAuditTrail();
        $results['Bulk Generation'] = $this->testBulkGeneration();

        // Summary
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "SUMMARY\n";
        echo str_repeat("=", 60) . "\n";
        
        foreach ($results as $test => $result) {
            $status = $result ? '✓ PASS' : '✗ FAIL';
            echo sprintf("%-30s %s\n", $test, $status);
        }

        $passed = count(array_filter($results));
        $total = count($results);
        echo "\nTotal: $passed/$total tests passed\n";
    }
}

// Main execution
if (php_sapi_name() !== 'cli') {
    die("This script must be run from command line\n");
}

if ($argc < 2) {
    echo "Usage: php test_seal_api.php <auth_token> [base_url]\n";
    echo "Example: php test_seal_api.php \"your_token_here\"\n";
    exit(1);
}

$authToken = $argv[1];
$baseUrl = $argv[2] ?? 'http://localhost:8000';

$tester = new SealSystemTester($authToken, $baseUrl);
$tester->runAll();
