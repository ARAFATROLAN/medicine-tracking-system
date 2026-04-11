# Medicine Seal System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Run Migrations
```bash
cd backend
php artisan migrate
```

### Step 2: Initialize Cryptographic Keys
```bash
php artisan crypto:init
```

You'll see output like:
```
✅ Cryptographic keys initialized successfully!
Signing Key ID: 1
Key Hash: abc123def456...
```

### Step 3: Verify Installation
Check that these tables exist:
- `seal_codes` - Stores seal information
- `seal_scans` - Records verification events  
- `cryptographic_keys` - Manages signing keys

```bash
php artisan tinker
>>> DB::select('SHOW TABLES LIKE "%seal%"')
```

## 📱 Using the Seal System

### For Pharmacists: Register Medicine with Seal

**Via Frontend:**
1. Go to Pharmacy Dashboard → Seal Generator
2. Select medicine from dropdown
3. Set optional batch number and location
4. Click "Generate Seal"
5. Print the seal or download QR code

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/seals/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 1,
    "quantity": 1,
    "batch_number": "BATCH-2026-04",
    "location_generated": "Main Pharmacy"
  }'
```

### For Scanning: Verify Medicine Authenticity

**Via Frontend:**
1. Go to Medicine Verification → Seal Scanner
2. Scan QR code or enter seal code manually
3. Optionally set location (pharmacy counter, hospital ward, etc.)
4. Click "Verify Seal"

**View Results:**
- ✓ Green = Authentic medicine (cryptographically verified)
- ✗ Red = Verification failed (potential counterfeit)

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/seals/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seal_code": "SEAL-XXXXXXXXXXXX-1234567890",
    "location": "Pharmacy Counter 1",
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

### Print Seals

**Via Frontend:**
1. After generating seal, click "Print" button
2. A new window opens with printable label
3. Click "Print / Save as PDF"
4. Affix printed seal to medicine packaging

**Label Contains:**
- Medicine name and brand
- Expiry date
- QR code (for scanning)
- Batch number
- Seal code
- Verification instructions

## 🔍 What Happens When You Scan

1. **QR Code Scan** → Seal code is extracted
2. **Verification** → System checks HMAC-SHA256 signature
3. **Authentication** → Medicine details are validated
4. **Audit Record** → Scan details logged:
   - Who scanned
   - When scanned
   - Where scanned (location)
   - GPS coordinates (if available)
   - Device information
   - IP address

5. **Result Display** → Shows:
   - ✓ Verification status (passed/failed)
   - Medicine name, brand, expiry date
   - Scan history/audit trail
   - Batch information

## 🛡️ Security Features

### Cryptographic Verification
- **Technology**: HMAC-SHA256 with 4096-bit RSA keys
- **Tamper Detection**: Any modification to seal data fails verification
- **Signature Check**: Timing-attack resistant comparison using `hash_equals()`

### Audit Trail
Every seal has a complete history:
```json
{
  "seal_code": "SEAL-ABC123-1234567890",
  "scans": [
    {
      "scanned_at": "2026-04-08 14:30:00",
      "location": "Main Pharmacy",
      "user": "Pharmacist John",
      "verification_status": "VERIFIED",
      "GPS": "12.9716, 77.5946"
    }
  ]
}
```

### Tampering Detection
System alerts on:
- ⚠️ Signature mismatch
- ⚠️ Medicine data changes
- ⚠️ Multiple unusual scans
- ⚠️ Location anomalies

## 🎯 Common Tasks

### Generate 100 Seals at Once
```bash
# Via API
curl -X POST http://localhost:8000/api/v1/seals/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 5,
    "quantity": 100,
    "batch_number": "BATCH-2026-04-LARGE"
  }'

# Via Frontend: Set quantity to 100, click Generate Seal
```

### View All Scans for a Medicine
```bash
# Via API
curl http://localhost:8000/api/v1/medicines/5/seals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Audit Trail for Specific Seal
```bash
# Via API
curl http://localhost:8000/api/v1/seals/SEAL-ABC123-1234567890/audit \
  -H "Authorization: Bearer YOUR_TOKEN"

# Via Frontend: Scan seal → Click "View Complete Audit Trail"
```

### Detect Tampering Attempts
```bash
curl -X POST http://localhost:8000/api/v1/seals/detect-tampering \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seal_code": "SEAL-ABC123-1234567890",
    "medicine_name": "Aspirin"
  }'
```

## 📊 Data Stored for Each Scan

When you scan a seal, the system records:

```json
{
  "seal_code_id": 1,
  "medicine_id": 5,
  "user_id": 3,
  "scanned_at": "2026-04-08T14:30:00Z",
  "location": "Main Pharmacy - Counter 1",
  "location_latitude": 12.9716,
  "location_longitude": 77.5946,
  "ip_address": "192.168.1.100",
  "device_info": "Chrome/Windows",
  "verification_status": true,
  "verification_error": null
}
```

## ✅ Best Practices

1. **Always Print Seals** - Affix to original medicine packaging
2. **Scan on Receiving** - Verify authenticity when medicine arrives
3. **Scan Before Dispensing** - Confirm seal before giving to patient
4. **Review Audit Trail** - Check for unusual scan patterns
5. **Rotate Keys Annually** - Run `php artisan crypto:rotate` (future)

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No active signing key" | Run `php artisan crypto:init` |
| QR code won't scan | Ensure good lighting, clear camera focus |
| Verification fails | Check seal code spelling, verify medicine exists |
| Database error | Run `php artisan migrate` again |

## 📞 API Token Required

All seal endpoints require authentication. Get token via login:

```bash
# Login
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pharmacist@example.com",
    "password": "password"
  }'

# Returns: { "token": "YOUR_TOKEN" }

# Use token in all seal API calls
curl -H "Authorization: Bearer YOUR_TOKEN" ...
```

## 🚀 Frontend Routes (Add to your app)

```jsx
// Seal Generator for Pharmacists
<Route path="/pharmacy/seals/generate" element={<SealGenerator />} />

// Seal Scanner for Verification
<Route path="/seals/scan" element={<SealScanner />} />

// Printable Seal Label
<Route path="/print-seal" element={<SealPrinter />} />
```

## 📚 Learn More

- Full documentation: [SEAL_SYSTEM_DOCUMENTATION.md](./SEAL_SYSTEM_DOCUMENTATION.md)
- API reference: [Full API Endpoints](./SEAL_SYSTEM_DOCUMENTATION.md#api-endpoints)
- Architecture details: [System Components](./SEAL_SYSTEM_DOCUMENTATION.md#architecture)

---

**That's it!** Your medicine seal system is ready. Start generating seals and scanning medicines with cryptographic verification! 🎉
