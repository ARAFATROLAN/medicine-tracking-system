# Medicine Seal System - Implementation Guide

## Overview

The Medicine Seal System is a cryptographically verifiable tracking mechanism for medicines in the medicine-tracking-system. It provides:

- **Automatic seal generation** when a pharmacist registers a medicine
- **Cryptographic verification** using HMAC-SHA256 signatures
- **QR code generation** for easy scanning and verification
- **Complete audit trail** of all scans and verifications
- **Tamper detection** capabilities
- **Printable seals** for physical medication packaging

## Architecture

### Components

1. **Database Models**
   - `SealCode` - Stores seal information with cryptographic signatures
   - `SealScan` - Records every scan/verification event
   - `CryptographicKey` - Manages cryptographic keys for signing/verification

2. **Services**
   - `SealGenerationService` - Generates new seals
   - `SealVerificationService` - Verifies seal authenticity
   - `QRCodeService` - Generates QR codes and printable labels

3. **API Controllers**
   - `SealController` - Handles all seal-related HTTP endpoints

4. **Frontend Components**
   - `SealGenerator` - Pharmacist interface for seal generation
   - `SealScanner` - Scanning and verification interface
   - `SealPrinter` - Printable seal label generation

## Database Schema

### seal_codes Table
```sql
- id: Primary Key
- code: Unique seal code (SEAL-XXXXXXXXXXXX-timestamp)
- medicine_id: Foreign key to medicines table
- signature: HMAC-SHA256 cryptographic signature
- public_key_hash: SHA256 hash of the public key used
- generated_at: Timestamp of seal generation
- qr_code_data: JSON payload for QR code
- batch_number: Batch identifier for medicines
- location_generated: Location where seal was created
- is_used: Boolean flag for seal use status
- used_at: Timestamp of first valid scan
- created_at, updated_at: Standard timestamps
```

### seal_scans Table
```sql
- id: Primary Key
- seal_code_id: Foreign key to seal_codes
- medicine_id: Foreign key to medicines
- user_id: Foreign key to users (who scanned)
- scanned_at: When the seal was scanned
- location: Where it was scanned (pharmacy, hospital, delivery point)
- location_latitude, location_longitude: GPS coordinates (if available)
- ip_address: IP address of scanning device
- device_info: Device information/user agent
- verification_status: Boolean - was verification successful
- verification_error: Error message if verification failed
- qr_payload: Full QR data that was scanned
- created_at, updated_at: Standard timestamps
```

### cryptographic_keys Table
```sql
- id: Primary Key
- key_type: 'seal_signing_key' or 'seal_verification_key'
- public_key: PEM format public key
- private_key: PEM format private key (only for signing keys)
- key_hash: SHA256 hash of the key
- algorithm: Signing algorithm (default: sha256)
- is_active: Boolean flag
- activated_at, deactivated_at: Key lifecycle timestamps
- created_by: Foreign key to users
- created_at, updated_at: Standard timestamps
```

## Setup Instructions

### 1. Database Migration

Run all migrations to create the required tables:

```bash
cd backend
composer install
php artisan migrate
```

The migrations include:
- `2026_04_08_100000_enhance_seal_codes_with_crypto.php` - Enhance seal_codes table
- `2026_04_08_100100_create_seal_scans_table.php` - Create scan audit trail
- `2026_04_08_100200_create_cryptographic_keys_table.php` - Create key management

### 2. Initialize Cryptographic Keys

Generate the RSA key pair for seal signing and verification:

```bash
php artisan crypto:init
```

This command:
- Generates a 4096-bit RSA key pair
- Creates both signing and verification keys
- Stores them securely in the database
- Outputs the key hash for reference

**Important**: The private key is stored only in the signing key record and should never be exposed. Make sure to:
- Regular backups of the database
- Restrict database access to authorized personnel
- Implement proper key rotation policies

### 3. Installation

All dependencies are included in the existing Laravel/React structure. To add QR code support (optional but recommended):

```bash
composer require endroid/qr-code
```

If not installed, the system will automatically fall back to using QR code API services.

## API Endpoints

### Generate Seal
```
POST /api/v1/seals/generate
```

**Request Body:**
```json
{
  "medicine_id": 1,
  "quantity": 1,
  "batch_number": "BATCH-2026-04-001",
  "location_generated": "Main Pharmacy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Seal(s) generated successfully",
  "data": {
    "seals": [
      {
        "id": 1,
        "code": "SEAL-XXXXXXXXXXXX-1234567890",
        "medicine_id": 1,
        "batch_number": "BATCH-2026-04-001",
        "generated_at": "2026-04-08T10:30:00Z",
        "is_valid": true
      }
    ],
    "total_generated": 1
  }
}
```

### Verify Seal
```
POST /api/v1/seals/verify
```

**Request Body:**
```json
{
  "seal_code": "SEAL-XXXXXXXXXXXX-1234567890",
  "location": "Pharmacy - Counter 1",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "device_info": "Mobile Scanner"
}
```

**Response (Valid Seal):**
```json
{
  "success": true,
  "status": "VERIFIED",
  "message": "Seal is cryptographically verified",
  "data": {
    "seal_code": "SEAL-XXXXXXXXXXXX-1234567890",
    "medicine": {
      "id": 1,
      "Name": "Aspirin",
      "Brand": "Bayer",
      "Expiry_Date": "2026-12-31"
    },
    "scanned_at": "2026-04-08T10:35:00Z",
    "scan_location": "Pharmacy - Counter 1",
    "batch_number": "BATCH-2026-04-001",
    "is_expired": false
  }
}
```

### Get Seal QR Code
```
GET /api/v1/seals/{sealCode}/qr-code
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
    "qr_data": "{\"v\":\"1.0\",\"seal_code\":\"...\",\"signature\":\"...\"}",
    "format": "svg",
    "seal_code": "SEAL-XXXXXXXXXXXX-1234567890",
    "medicine_name": "Aspirin",
    "expiry_date": "2026-12-31",
    "batch_number": "BATCH-2026-04-001"
  }
}
```

### Get Printable Seal
```
GET /api/v1/seals/{sealCode}/print
```

**Response:**
```json
{
  "success": true,
  "data": {
    "seal_code": "SEAL-XXXXXXXXXXXX-1234567890",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?...",
    "medicine_name": "Aspirin",
    "medicine_brand": "Bayer",
    "medicine_generic_name": "Acetylsalicylic Acid",
    "strength": "500mg",
    "dosage_form": "Tablet",
    "expiry_date": "2026-12-31",
    "batch_number": "BATCH-2026-04-001",
    "generated_at": "2026-04-08 10:30:00",
    "location": "Main Pharmacy",
    "verification_url": "https://app.medicine-tracker.com/verify?code=...",
    "print_instructions": "Print this seal and affix it to the medicine packaging..."
  }
}
```

### Get Seal Audit Trail
```
GET /api/v1/seals/{sealCode}/audit
```

**Response:**
```json
{
  "success": true,
  "data": {
    "seal_code": "SEAL-XXXXXXXXXXXX-1234567890",
    "verification_status": "VERIFIED",
    "is_valid": true,
    "generated_at": "2026-04-08T10:30:00Z",
    "medicine": {
      "id": 1,
      "Name": "Aspirin",
      "Brand": "Bayer",
      "Expiry_Date": "2026-12-31"
    },
    "scan_count": 3,
    "scans": [
      {
        "id": 1,
        "scanned_at": "2026-04-08T10:35:00Z",
        "location": "Pharmacy - Counter 1",
        "user": {
          "id": 5,
          "name": "John Pharmacist",
          "email": "john@pharmacy.com"
        },
        "ip_address": "192.168.1.100",
        "device_info": "Chrome on Windows",
        "verification_status": "VERIFIED",
        "verification_error": null
      }
    ],
    "batch_number": "BATCH-2026-04-001",
    "location_generated": "Main Pharmacy"
  }
}
```

### Detect Tampering
```
POST /api/v1/seals/detect-tampering
```

**Request Body:**
```json
{
  "seal_code": "SEAL-XXXXXXXXXXXX-1234567890",
  "medicine_name": "Aspirin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_tampered": false,
    "tampering_indicators": [],
    "verification_status": true
  }
}
```

### Get Medicine Seals
```
GET /api/v1/medicines/{medicineId}/seals
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "code": "SEAL-XXXXXXXXXXXX-1234567890",
        "is_used": true,
        "used_at": "2026-04-08T10:35:00Z",
        "medicine_id": 1,
        "created_at": "2026-04-08T10:30:00Z",
        "updated_at": "2026-04-08T10:35:00Z"
      }
    ],
    "links": {...},
    "meta": {...}
  }
}
```

## Frontend Usage

### 1. Seal Generator Component

Used by pharmacists to register medicines with seals:

```jsx
import SealGenerator from '@/components/SealGenerator';

export default function PharmacyDashboard() {
  return <SealGenerator />;
}
```

**Features:**
- Select medicine from inventory
- Set batch number and location
- Generate single or bulk seals
- Print and download QR codes

### 2. Seal Scanner Component

Used for scanning and verifying seals:

```jsx
import SealScanner from '@/components/SealScanner';

export default function ScannerPage() {
  return <SealScanner />;
}
```

**Features:**
- Scan QR codes or enter seal codes manually
- Record scan location and GPS coordinates
- View verification status
- Access complete audit trail

### 3. Seal Printer Component

Generates printable seal labels:

```jsx
import SealPrinter from '@/components/SealPrinter';

// Accessed via: /print-seal?code=SEAL-XXXXXXXXXXXX-1234567890
export default function PrintPage() {
  return <SealPrinter />;
}
```

## Cryptographic Implementation

### Signing Algorithm
- **Algorithm**: HMAC-SHA256
- **Key Length**: 4096-bit RSA
- **Format**: PEM

### Signature Generation Process
1. Medicine data is serialized to JSON with:
   - Medicine ID and name
   - Brand and generic name
   - Batch number
   - Expiry date
   - Generated timestamp
   - Stock quantity

2. HMAC-SHA256 signature is generated using the serialized data and private key

3. Signature is stored in the seal_codes table as hexadecimal string

### Verification Process
1. Seal code is retrieved from database
2. Medicine data is reconstructed from the seal record
3. Fresh HMAC-SHA256 signature is generated
4. Generated signature is compared with stored signature using `hash_equals()` for timing-attack resistance
5. Medicine expiry date is checked
6. Scan event is recorded if verification passes

### Tamper Detection
The system detects potential tampering through:
- Signature mismatch (indicates data modification)
- Medicine data mismatch
- Multiple scans in unusual patterns
- Time gaps in scan records
- Location anomalies

## Security Considerations

### Key Management
- Generate new keys annually or when compromised
- Store private keys in encrypted vault (future enhancement)
- Implement key rotation policies
- Maintain access logs for key usage

### Data Protection
- All sensitive data should be transmitted over HTTPS
- API authentication via Laravel Sanctum tokens
- Database encryption at rest (future enhancement)
- Audit logging for all seal operations

### Seal Integrity
- QR codes are tamper-evident due to signature verification
- Multiple scans on a seal indicate distribution chain
- Integration with GPS prevents location spoofing
- IP address logging for suspicious activities

## Troubleshooting

### "No active signing key available"
**Solution**: Run `php artisan crypto:init` to initialize keys

### QR Code Not Loading
**Solution**: If endroid/qr-code not installed, ensure internet connection for API fallback. Install with: `composer require endroid/qr-code`

### Verification Failed
**Action Items**:
1. Check seal code spelling
2. Verify medicine exists in database
3. Check medicine expiry date
4. Review audit trail for signature mismatches

### Database Migration Errors
**Solution**: Ensure all previous migrations completed successfully:
```bash
php artisan migrate:status
```

## Future Enhancements

1. **Hardware Integration**
   - RFID tag integration for seals
   - Barcode scanner optimization
   - Mobile app for offline scanning

2. **Advanced Security**
   - Hardware security module (HSM) for key storage
   - Blockchain integration for immutable audit trail
   - Multi-signature verification

3. **Analytics**
   - Seal scan analytics dashboard
   - Distribution tracking reports
   - Tampering attempt alerts
   - Real-time monitoring

4. **Integration**
   - Pharmacy management system integration
   - Hospital inventory systems
   - Regulatory compliance reporting
   - Insurance verification

## Compliance

This seal system supports:
- Track and trace requirements
- Counterfeit detection
- Regulatory audit trails
- Data protection regulations (GDPR, etc.)
- WHO guidelines on medicine tracking

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API endpoint documentation
3. Check Laravel logs: `storage/logs/laravel.log`
4. Review database audit tables for detailed events
