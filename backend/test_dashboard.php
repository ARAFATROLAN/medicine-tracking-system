<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Create a test request
$request = \Illuminate\Http\Request::create('/api/v1/dashboard', 'GET');
$request->headers->set('Authorization', 'Bearer test-token');

// Handle the request
$response = $kernel->handle($request);

echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Body: " . $response->getContent() . "\n";
