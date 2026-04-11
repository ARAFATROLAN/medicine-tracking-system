#!/bin/bash

# Medicine Seal System - API Testing Script
# This script demonstrates all seal system endpoints

BASE_URL="http://localhost:8000/api/v1"
AUTH_TOKEN="YOUR_AUTH_TOKEN_HERE"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Medicine Seal System API Tests ===${NC}\n"

# Test 1: Generate Seal
echo -e "${YELLOW}1. Testing Seal Generation${NC}"
echo "POST $BASE_URL/seals/generate"
SEAL_RESPONSE=$(curl -s -X POST "$BASE_URL/seals/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 1,
    "quantity": 1,
    "batch_number": "BATCH-2026-04-TEST-001",
    "location_generated": "Main Pharmacy"
  }')

echo "$SEAL_RESPONSE" | jq .
SEAL_CODE=$(echo "$SEAL_RESPONSE" | jq -r '.data.seals[0].code // "SEAL-TEST-NOT-FOUND"')
echo -e "${GREEN}Seal Code: $SEAL_CODE${NC}\n"

# Extract seal code for next tests
if [ "$SEAL_CODE" = "SEAL-TEST-NOT-FOUND" ]; then
  echo -e "${YELLOW}Note: Using example seal code for testing${NC}"
  SEAL_CODE="SEAL-XXXXXXXXXXXXXX-1234567890"
fi

# Test 2: Get Seal Details
echo -e "${YELLOW}2. Testing Get Seal Details${NC}"
echo "GET $BASE_URL/seals/$SEAL_CODE"
curl -s -X GET "$BASE_URL/seals/$SEAL_CODE" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""

# Test 3: Get QR Code
echo -e "${YELLOW}3. Testing Get QR Code${NC}"
echo "GET $BASE_URL/seals/$SEAL_CODE/qr-code"
curl -s -X GET "$BASE_URL/seals/$SEAL_CODE/qr-code" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""

# Test 4: Get Printable Seal
echo -e "${YELLOW}4. Testing Get Printable Seal${NC}"
echo "GET $BASE_URL/seals/$SEAL_CODE/print"
curl -s -X GET "$BASE_URL/seals/$SEAL_CODE/print" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""

# Test 5: Verify Seal
echo -e "${YELLOW}5. Testing Seal Verification${NC}"
echo "POST $BASE_URL/seals/verify"
curl -s -X POST "$BASE_URL/seals/verify" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"seal_code\": \"$SEAL_CODE\",
    \"location\": \"Pharmacy - Counter 1\",
    \"latitude\": 12.9716,
    \"longitude\": 77.5946,
    \"device_info\": \"API Test Client\"
  }" | jq .
echo ""

# Test 6: Get Audit Trail
echo -e "${YELLOW}6. Testing Get Audit Trail${NC}"
echo "GET $BASE_URL/seals/$SEAL_CODE/audit"
curl -s -X GET "$BASE_URL/seals/$SEAL_CODE/audit" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
echo ""

# Test 7: Detect Tampering
echo -e "${YELLOW}7. Testing Tampering Detection${NC}"
echo "POST $BASE_URL/seals/detect-tampering"
curl -s -X POST "$BASE_URL/seals/detect-tampering" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"seal_code\": \"$SEAL_CODE\",
    \"medicine_name\": \"Aspirin\"
  }" | jq .
echo ""

# Test 8: Generate Bulk Seals
echo -e "${YELLOW}8. Testing Bulk Seal Generation${NC}"
echo "POST $BASE_URL/seals/generate (quantity: 10)"
curl -s -X POST "$BASE_URL/seals/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 1,
    "quantity": 10,
    "batch_number": "BATCH-2026-04-BULK",
    "location_generated": "Main Pharmacy"
  }' | jq '{ success, message, total_generated: .data.total_generated }'
echo ""

# Test 9: Get Medicine Seals
echo -e "${YELLOW}9. Testing Get Medicine Seals${NC}"
echo "GET $BASE_URL/medicines/1/seals"
curl -s -X GET "$BASE_URL/medicines/1/seals" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data | length as $count | { success: true, total_seals: $count }'
echo ""

echo -e "${GREEN}=== All Tests Completed ===${NC}"
echo -e "${YELLOW}Note: Replace AUTH_TOKEN with your actual Laravel Sanctum token${NC}"
