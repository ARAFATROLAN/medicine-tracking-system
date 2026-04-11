# PowerShell test script for prescription API

Write-Host "=== Testing Prescription API ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get token
Write-Host "Step 1: Getting login token..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/login" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body (@{
    email = "doctor@example.com"
    password = "password"
  } | ConvertTo-Json) `
  -ErrorAction SilentlyContinue

if ($loginResponse) {
  $loginData = $loginResponse.Content | ConvertFrom-Json
  $token = $loginData.access_token
  
  if ($token) {
    Write-Host "✓ Got token: $($token.Substring(0, 20))..." -ForegroundColor Green
  } else {
    Write-Host "✗ Failed to get token!" -ForegroundColor Red
    Write-Host "Response: $($loginResponse.Content)" -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "✗ Login request failed!" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Step 2: Get patients
Write-Host "Step 2: Getting patients..." -ForegroundColor Yellow
$patientsResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/patients" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -ErrorAction SilentlyContinue

if ($patientsResponse) {
  $patientsData = $patientsResponse.Content | ConvertFrom-Json
  $patientId = $patientsData.data[0].id
  
  if ($patientId) {
    Write-Host "✓ Using patient ID: $patientId" -ForegroundColor Green
  } else {
    Write-Host "✗ No patients found!" -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "✗ Failed to get patients!" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Step 3: Get medicines
Write-Host "Step 3: Getting medicines..." -ForegroundColor Yellow
$medicineResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/medicines" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -ErrorAction SilentlyContinue

if ($medicineResponse) {
  $medicineData = $medicineResponse.Content | ConvertFrom-Json
  $medicineId = $medicineData.data[0].id
  
  if ($medicineId) {
    Write-Host "✓ Using medicine ID: $medicineId" -ForegroundColor Green
  } else {
    Write-Host "✗ No medicines found!" -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "✗ Failed to get medicines!" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Step 4: Create prescription
Write-Host "Step 4: Creating prescription..." -ForegroundColor Yellow
$prescriptionBody = @{
  patient_id = $patientId
  medicines = @(
    @{
      id = $medicineId
      quantity = 2
      dosage = "1 tablet twice daily"
    }
  )
  notes = "Test prescription from PowerShell"
} | ConvertTo-Json

Write-Host "Request body: $prescriptionBody" -ForegroundColor Gray
Write-Host ""

try {
  $prescriptionResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/prescriptions" `
    -Method POST `
    -Headers @{
      "Authorization" = "Bearer $token"
      "Content-Type" = "application/json"
    } `
    -Body $prescriptionBody `
    -ErrorAction Stop
  
  $prescriptionData = $prescriptionResponse.Content | ConvertFrom-Json
  
  if ($prescriptionData.status) {
    Write-Host "✓ Prescription created successfully!" -ForegroundColor Green
    Write-Host "Prescription ID: $($prescriptionData.data.id)" -ForegroundColor Green
    Write-Host "Response: $($prescriptionResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
  } else {
    Write-Host "✗ API returned error!" -ForegroundColor Red
    Write-Host "Response: $($prescriptionResponse.Content)" -ForegroundColor Red
  }
} catch {
  $errorResponse = $_.Exception.Response
  if ($errorResponse) {
    $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "✗ Prescription creation failed!" -ForegroundColor Red
    Write-Host "Status Code: $($errorResponse.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
  } else {
    Write-Host "✗ Request error: $($_.Exception.Message)" -ForegroundColor Red
  }
}
