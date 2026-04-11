#!/bin/bash

# Test prescription creation API
echo "=== Testing Prescription API ==="
echo ""

# Step 1: Get login token
echo "Step 1: Getting login token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@example.com","password":"password"}')

echo "Login Response: $TOKEN_RESPONSE"
echo ""

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token' 2>/dev/null || echo "")

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to get token!"
  exit 1
fi

echo "✓ Got token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get patients
echo "Step 2: Getting patients..."
PATIENTS=$(curl -s -X GET http://localhost:8000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Patients Response: $PATIENTS"
PATIENT_ID=$(echo $PATIENTS | jq -r '.data[0].id' 2>/dev/null || echo "")

if [ -z "$PATIENT_ID" ] || [ "$PATIENT_ID" = "null" ]; then
  echo "No patients found!"
  exit 1
fi

echo "✓ Using patient ID: $PATIENT_ID"
echo ""

# Step 3: Get medicines
echo "Step 3: Getting medicines..."
MEDICINES=$(curl -s -X GET http://localhost:8000/api/v1/medicines \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Medicines Response: $MEDICINES"
MEDICINE_ID=$(echo $MEDICINES | jq -r '.data[0].id' 2>/dev/null || echo "")

if [ -z "$MEDICINE_ID" ] || [ "$MEDICINE_ID" = "null" ]; then
  echo "No medicines found!"
  exit 1
fi

echo "✓ Using medicine ID: $MEDICINE_ID"
echo ""

# Step 4: Create prescription
echo "Step 4: Creating prescription..."
PRESCRIPTION=$(curl -s -X POST http://localhost:8000/api/v1/prescriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": '${PATIENT_ID}',
    "medicines": [
      {
        "id": '${MEDICINE_ID}',
        "quantity": 2,
        "dosage": "1 tablet twice daily"
      }
    ],
    "notes": "Test prescription"
  }')

echo "Prescription Response:"
echo $PRESCRIPTION | jq . 2>/dev/null || echo $PRESCRIPTION
