# Medicine Seal System - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MEDICINE SEAL SYSTEM ARCHITECTURE               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │  SealGenerator  │  │  SealScanner     │  │  SealPrinter       │ │
│  │                 │  │                  │  │                    │ │
│  │ • Select Med    │  │ • Scan QR Code   │  │ • Print to PDF     │ │
│  │ • Set Batch#    │  │ • Manual Entry   │  │ • Display Label    │ │
│  │ • Set Location  │  │ • GPS Location   │  │ • Show Medicine    │ │
│  │ • Generate Seal │  │ • Verify Sig     │  │ • Show Expiry      │ │
│  │ • Print Label   │  │ • View Audit     │  │ • Show Batch       │ │
│  │ • Download QR   │  │                  │  │ • Show Seal Code   │ │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬───────────┘ │
│           │                    │                     │              │
│           └────────────────────┼─────────────────────┘              │
│                                │                                     │
│              Sanctum Token Authentication                            │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   API Gateway (Sanctum)  │
                    └────────────┬─────────────┘
                                 │
┌────────────────────────────────┼─────────────────────────────────────┐
│                          LARAVEL BACKEND                             │
├────────────────────────────────┼─────────────────────────────────────┤
│                                │                                     │
│        ┌──────────────────────▼──────────────────────┐              │
│        │   SealController (API Endpoints)           │              │
│        ├──────────────────────────────────────────┬─┘              │
│        │ • generateSeal()                         │                │
│        │ • verifySeal()                           │                │
│        │ • getQRCode()                            │                │
│        │ • getPrintableSeal()                     │                │
│        │ • getAuditTrail()                        │                │
│        │ • detectTampering()                      │                │
│        └────────────┬────────────────────────────┘                │
│                     │                                              │
│    ┌────────────────┼────────────────┐                           │
│    │                │                │                           │
│    ▼                ▼                ▼                           │
│ ┌──────────┐  ┌──────────────┐  ┌────────────┐                 │
│ │ Seal     │  │ Seal         │  │ QRCode     │                 │
│ │ Generation   │ Verification │  │ Service    │                 │
│ │ Service  │  │ Service      │  │            │                 │
│ │          │  │              │  │ • Generate │                 │
│ │ • Generate  │ • Verify Sig │  │   QRCode   │                 │
│ │   Seal   │  │ • Record     │  │ • Print    │                 │
│ │ • Generate  │   Scan       │  │   Label    │                 │
│ │   Bulk   │  │ • Check      │  │ • Generate │                 │
│ │   Seals  │  │   Expiry     │  │   Barcode  │                 │
│ │ • Create │  │ • Get Audit  │  │            │                 │
│ │   QR     │  │ • Detect     │  └────────────┘                 │
│ │   Payload    │   Tamper     │                                │
│ └──┬───────┘  └──┬──────────┘                                │
│    │             │                                            │
│    └─────────────┼─────────────▶ Data Models                 │
│                  │         ┌─────────────────┐               │
│                  │         │ • SealCode      │               │
│                  │         │ • SealScan      │               │
│                  │         │ • CryptKey      │               │
│                  │         └─────────────────┘               │
│                  │                                            │
└──────────────────┼────────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Cryptographic Keys │
        ├─────────────────────┤
        │                     │
        │ Private Key ◄──┐    │
        │ (Signing)      │    │
        │                ├──HMAC-SHA256
        │ Public Key ─►──┤    │
        │ (Verify)       │    │
        │                └─►┌─────┐
        │                   │HASH │
        │ Key Hash ────────▶│EQ   │
        │ (Verify)          └─────┘
        └─────────────────────┘
                   │
┌──────────────────▼──────────────────┐
│        DATABASE (MySQL)             │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────┐ ┌──────────────┐  │
│ │ seal_codes  │ │ seal_scans   │  │
│ │             │ │              │  │
│ │ • code      │ │ • scanned_at │  │
│ │ • signature │ │ • location   │  │
│ │ • qr_data   │ │ • latitude   │  │
│ │ • batch_#   │ │ • longitude  │  │
│ │ • location  │ │ • ip_address │  │
│ │ • is_used   │ │ • device_info    │
│ │ • medicine_ │ │ • verified   │  │
│ │   id        │ │ • error_msg  │  │
│ └─────────────┘ └──────────────┘  │
│       │               │             │
│       └───────┬───────┘             │
│               │                     │
│ ┌─────────────▼──────────────┐    │
│ │ cryptographic_keys         │    │
│ │                            │    │
│ │ • public_key (PEM)         │    │
│ │ • private_key (PEM)        │    │
│ │ • key_hash (SHA256)        │    │
│ │ • algorithm (sha256)       │    │
│ │ • is_active (boolean)      │    │
│ │ • key_type                 │    │
│ │   (signing/verification)   │    │
│ └────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Data Flow Diagram

### Seal Generation Flow

```
Pharmacist Interface
        │
        ▼
    SELECT MEDICINE
        │
        ▼
    SET BATCH # & LOCATION
        │
        ▼
    CLICK GENERATE
        │
        ▼
    ┌─────────────────────────────────────┐
    │   SealGenerationService             │
    │                                     │
    │  1. Generate Random Seal Code       │
    │     SEAL-XXXXXXXXXXXX-timestamp     │
    │                                     │
    │  2. Get Active Signing Key          │
    │     (from cryptographic_keys table) │
    │                                     │
    │  3. Prepare Data JSON               │
    │     {medicine_id, name, brand,      │
    │      batch, expiry, date}           │
    │                                     │
    │  4. Generate HMAC-SHA256 Signature  │
    │     signature = HMAC_SHA256(        │
    │       data, private_key)            │
    │                                     │
    │  5. Create QR Payload               │
    │     {v, seal_code, signature,       │
    │      medicine_data}                 │
    │                                     │
    │  6. Store in Database               │
    │     seal_codes table                │
    └─────────────────────────────────────┘
        │
        ▼
    SEAL CREATED & STORED
        │
        ▼
    GET QR CODE
    (from QRCodeService)
        │
        ▼
    ┌─────────────────────┐
    │   Generate QR Code  │
    │                     │
    │  Option 1: Local    │
    │  endroid/qr-code    │
    │                     │
    │  Option 2: API      │
    │  qr-server.com      │
    └─────────────────────┘
        │
        ▼
    DISPLAY PRINTABLE LABEL
        │
        ├─ Medicine Name & Brand
        ├─ QR Code Image
        ├─ Seal Code
        ├─ Batch Number
        ├─ Expiry Date
        ├─ Location Generated
        └─ Verification URL
        │
        ▼
    PRINT TO PDF
        │
        ▼
    AFFIX TO PACKAGING
```

### Seal Verification Flow

```
Scanner Interface
        │
        ▼
    SCAN QR CODE (or Enter Seal Code)
        │
        ▼
    ┌──────────────────────────────────────┐
    │   SealVerificationService            │
    │                                      │
    │  1. Retrieve Seal from Database      │
    │     BY seal_code                     │
    │                                      │
    │  2. Get Associated Medicine          │
    │                                      │
    │  3. Get Public Key for Verification  │
    │     (from cryptographic_keys)        │
    │                                      │
    │  4. Reconstruct Data JSON            │
    │     Same format as generation        │
    │                                      │
    │  5. Generate Fresh HMAC Signature    │
    │     fresh_sig = HMAC_SHA256(         │
    │       data, public_key)              │
    │                                      │
    │  6. Compare Signatures               │
    │     hash_equals(                     │
    │       fresh_sig,                     │
    │       stored_sig)                    │
    │     ↓                                │
    │   YES → VERIFIED                     │
    │   NO  → FAILED                       │
    │                                      │
    │  7. Check Medicine Expiry            │
    │     if (expiry > now()) ✓ VALID      │
    │     else ✗ EXPIRED                   │
    │                                      │
    │  8. Record Scan Event                │
    │     Create SealScan record:          │
    │     • seal_code_id                   │
    │     • user_id                        │
    │     • location                       │
    │     • latitude/longitude             │
    │     • ip_address                     │
    │     • device_info                    │
    │     • verification_status            │
    │     • timestamp                      │
    └──────────────────────────────────────┘
        │
        ▼
    ┌─────────────────────────┐
    │  VERIFICATION COMPLETE  │
    │                         │
    │  ✓ VERIFIED             │  OR  ✗ FAILED
    │                         │
    │  • Medicine Details     │      Error Message
    │  • Expiry Date          │      (Signature/Expired)
    │  • Batch Number         │
    │  • Scan Time & Location │
    │  • View Audit Trail ──┐ │
    └────────────┬──────────┼─┘
                 │          │
                 ▼          ▼
            DISPLAY    AUDIT TRAIL
            RESULTS    DATABASE
                       UPDATED
```

## Key Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                 Component Interaction Graph                 │
└─────────────────────────────────────────────────────────────┘

    SealGenerator Component
            │
            │ (1. Select Medicine)
            ▼
    SealGenerationService ◄──── CryptographicKey (Public)
            │
            │ (2. Create Seal)
            ▼
        Database: seal_codes
            │
            │ (3. Get QR Code)
            ▼
    QRCodeService ──────────► External QR API
            │                 (qr-server.com)
            │
            ▼
    PrintableLabel (HTML/PDF)
            │
            └──────────────► Patient/User
                            (Scans Later)
                                │
                                ▼
                        SealScanner Component
                                │
                                │ (4. Scan QR)
                                ▼
                        SealVerificationService ◄─ CryptographicKey
                                │                  (Private for
                                │                   verification)
                                │ (5. Verify Sig)
                                ▼
                        Database: seal_scans
                                │
                                ▼
                        Verification Result
                        ✓ VERIFIED or ✗ FAILED
                                │
                                ▼
                        Audit Trail
                        (View Scan History)
```

## Security & Cryptography Flow

```
┌──────────────────────────────────────────────────────────┐
│         Cryptographic Signature Flow (HMAC-SHA256)        │
└──────────────────────────────────────────────────────────┘

SIGNING (At Seal Generation):
═════════════════════════════════════════════════════════════

  Medicine Data
  ├─ medicine_id: 5
  ├─ Name: Aspirin
  ├─ Brand: Bayer
  ├─ expiry_date: 2026-12-31
  ├─ batch_number: BATCH-2026-04
  └─ timestamp: 2026-04-08T10:30:00Z
      │
      ▼
  JSON.stringify() + JSON_UNESCAPED_SLASHES
      │
      ▼
  Data String (256 bytes)
  {\"medicine_id\":5,\"Name\":\"Aspirin\",...}
      │
      ▼
  ┌─────────────────────────────────┐
  │  HMAC-SHA256(data, PrivateKey)  │
  │  hash_hmac('sha256', data, key) │
  └─────────────────────────────────┘
      │
      ▼
  Hexadecimal Signature (64 chars)
  a1b2c3d4e5f6...0xyz7890abcdef

  Stored in: seal_codes.signature
  Stored in: seal_codes.public_key_hash


VERIFICATION (At Seal Scan):
═════════════════════════════════════════════════════════════

  1. Retrieve Seal from Database
     └─ Get: code, signature, medicine_id

  2. Reconstruct Medicine Data
     (Same JSON format as signing)
         │
         ▼
     Data String (Must match exactly)

  3. Get Active Public Key
     └─ CryptographicKey::getActiveVerificationKey()

  4. Generate Fresh Signature
     ┌──────────────────────────────────────┐
     │ HMAC-SHA256(data, PublicKey)         │
     │ fresh_sig = hash_hmac('sha256', ...) │
     └──────────────────────────────────────┘

  5. Compare Signatures (Timing-Attack Safe)
     ┌──────────────────────────────────┐
     │ hash_equals(fresh_sig, stored_sig)│
     │                                  │
     │ Returns:                         │
     │ TRUE  → Signature Valid ✓        │
     │ FALSE → Tampering Detected ✗    │
     └──────────────────────────────────┘


TAMPERING DETECTION:
═════════════════════════════════════════════════════════════

  If data changed (even 1 byte):
  ├─ Generated signature ≠ Stored signature
  ├─ hash_equals() returns false
  ├─ System flags as TAMPERED
  └─ Scan marked as FAILED

  If signature modified:
  ├─ Data won't match signature
  ├─ hash_equals() returns false
  └─ System flags as TAMPERED
```

## Database Relationships

```
┌──────────────────────────────────────────────────────┐
│            Database Entity Relationships             │
└──────────────────────────────────────────────────────┘

       medicines
           │
           │ 1:N
           │
       ┌───┴──────────────────┐
       │                      │
   seal_codes          medicine_inventory
       │
       │ 1:N
       │
   seal_scans
       │
       ├─► users (1:N - who scanned)
       │
       └─► NA (audit trail end point)


seal_codes ─── cryptographic_keys
   (many)           (1 key per sign)
     ├─ signature field
     │  references: public_key_hash
     │
     └─ Verify: hash_equals(signature, generated)


Audit flow:
seal_scans stores complete history:
├─ scanned_at (timestamp)
├─ location (pharmacy, hospital)
├─ latitude/longitude (GPS)
├─ ip_address (device location)
├─ user_id (who verified)
├─ verification_status (success/fail)
└─ device_info (browser, OS)
```

---

## Complete System Workflow

```
DAY 1 - REGISTRATION:
═════════════════════════════════════════════════════════════
  Pharmacist registers medicine
         │
         ▼
  AUTOMATIC: Seal generated with signature
         │
         ▼
  Seal printed with QR code
         │
         ▼
  Attached to medicine package
         │
         ▼
  Ready for distribution


DAY 3 - HOSPITAL RECEIPT:
═════════════════════════════════════════════════════════════
  Medicine arrives at hospital
         │
         ▼
  Pharmacist scans seal
         │
         ▼
  System verifies signature ✓
         │
         ▼
  Scan recorded:
  • Location: Main Hospital Pharmacy
  • Time: 2026-04-03 14:30:00
  • GPS: 12.9716, 77.5946
  • User: Pharmacist John
         │
         ▼
  Audit trail updated


DAY 7 - WARD DISTRIBUTION:
═════════════════════════════════════════════════════════════
  Nurse prepares medication
         │
         ▼
  Scans seal before dispensing
         │
         ▼
  System verifies ✓
         │
         ▼
  Scan recorded:
  • Location: Ward A - Bed 5
  • Time: 2026-04-07 08:30:00
  • User: Nurse Sarah
         │
         ▼
  Patient receives medicine


AUDIT TRAIL COMPLETE:
═════════════════════════════════════════════════════════════
  ┌──────────────────────────────┐
  │  Complete Chain of Custody   │
  ├──────────────────────────────┤
  │ 1. Generated @ Pharmacy      │
  │    2026-04-02 10:30          │
  │    Location: Main Pharmacy   │
  │                              │
  │ 2. Received @ Hospital       │
  │    2026-04-03 14:30          │
  │    Location: Hospital Pharm  │
  │    User: John Pharmacist     │
  │                              │
  │ 3. Dispensed @ Ward          │
  │    2026-04-07 08:30          │
  │    Location: Ward A          │
  │    User: Sarah Nurse         │
  │                              │
  │ ✓ All signatures verified    │
  │ ✓ Complete traceability      │
  │ ✓ No tampering detected      │
  └──────────────────────────────┘
```

---

This architecture ensures:
✅ **Security**: HMAC-SHA256 cryptographic verification
✅ **Traceability**: Complete audit trail with GPS
✅ **Integrity**: Tamper detection
✅ **Scalability**: Indexed database for performance
✅ **Reliability**: Multiple verification layers
