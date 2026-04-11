<?php

namespace App\Services;

use App\Models\SealCode;
use App\Models\SealScan;
use App\Models\Medicine;
use App\Models\CryptographicKey;
use Carbon\Carbon;

class SealVerificationService
{
    /**
     * Verify a seal's cryptographic signature
     *
     * @param SealCode $seal
     * @return array
     */
    public function verifySeal(SealCode $seal): array
    {
        try {
            // Get the public key hash to find the right key for verification
            $keyHash = $seal->public_key_hash;
            $verificationKey = CryptographicKey::where('key_hash', $keyHash)->first();
            
            if (!$verificationKey) {
                return $this->createVerificationError('Verification key not found', false);
            }

            // Prepare the data to verify against
            $medicine = $seal->medicine;
            if (!$medicine) {
                return $this->createVerificationError('Associated medicine not found', false);
            }

            $dataString = $this->prepareVerificationData($seal, $medicine);
            
            // Verify the signature using HMAC
            $expectedSignature = hash_hmac('sha256', $dataString, $verificationKey->public_key, false);
            
            if (!hash_equals($seal->signature, $expectedSignature)) {
                return $this->createVerificationError('Signature verification failed', false);
            }

            // Check if medicine is still valid
            if (!$seal->isValid()) {
                return $this->createVerificationError('Seal or medicine expired', false);
            }

            return [
                'is_valid' => true,
                'status' => 'VERIFIED',
                'message' => 'Seal is cryptographically verified',
                'seal_id' => $seal->id,
                'medicine' => $medicine->only(['id', 'Name', 'Brand', 'Expiry_Date']),
                'seal_generated_at' => $seal->generated_at,
                'batch_number' => $seal->batch_number
            ];
        } catch (\Exception $e) {
            return $this->createVerificationError($e->getMessage(), false);
        }
    }

    /**
     * Record a seal scan with verification
     *
     * @param SealCode $seal
     * @param array $scanData
     * @return SealScan
     */
    public function recordScan(SealCode $seal, array $scanData): SealScan
    {
        $verificationResult = $this->verifySeal($seal);
        
        $scan = SealScan::create([
            'seal_code_id' => $seal->id,
            'medicine_id' => $seal->medicine_id,
            'user_id' => $scanData['user_id'] ?? null,
            'branch_device_id' => $scanData['branch_device_id'] ?? null,
            'scanned_at' => $scanData['scanned_at'] ?? Carbon::now(),
            'location' => $scanData['location'] ?? null,
            'location_latitude' => $scanData['latitude'] ?? null,
            'location_longitude' => $scanData['longitude'] ?? null,
            'ip_address' => $scanData['ip_address'] ?? null,
            'device_info' => $scanData['device_info'] ?? null,
            'verification_status' => $verificationResult['is_valid'],
            'verification_error' => $verificationResult['is_valid'] ? null : $verificationResult['message'],
            'qr_payload' => $scanData['qr_payload'] ?? null
        ]);

        // Mark seal as used on first valid scan
        if ($verificationResult['is_valid']) {
            $seal->update([
                'is_used' => true,
                'used_at' => Carbon::now()
            ]);
        }

        return $scan;
    }

    /**
     * Get complete verification audit trail for a seal
     *
     * @param SealCode $seal
     * @return array
     */
    public function getAuditTrail(SealCode $seal): array
    {
        $verification = $this->verifySeal($seal);
        
        $scans = $seal->scans()
            ->with(['user', 'medicine'])
            ->orderBy('scanned_at', 'desc')
            ->get()
            ->map(function ($scan) {
                return [
                    'id' => $scan->id,
                    'scanned_at' => $scan->scanned_at,
                    'location' => $scan->location,
                    'user' => $scan->user?->only(['id', 'name', 'email']) ?? null,
                    'branch_device' => $scan->branchDevice?->only(['id', 'name', 'identifier', 'location']) ?? null,
                    'ip_address' => $scan->ip_address,
                    'device_info' => $scan->device_info,
                    'verification_status' => $scan->verification_status ? 'VERIFIED' : 'FAILED',
                    'verification_error' => $scan->verification_error
                ];
            });

        return [
            'seal_code' => $seal->code,
            'verification_status' => $verification['status'],
            'is_valid' => $verification['is_valid'],
            'generated_at' => $seal->generated_at,
            'medicine' => $seal->medicine?->only(['id', 'Name', 'Brand', 'Expiry_Date']),
            'scan_count' => $scans->count(),
            'scans' => $scans,
            'batch_number' => $seal->batch_number,
            'location_generated' => $seal->location_generated
        ];
    }

    /**
     * Detect tampering attempts
     *
     * @param SealCode $seal
     * @param array $submittedData
     * @return array
     */
    public function detectTampering(SealCode $seal, array $submittedData): array
    {
        $verification = $this->verifySeal($seal);
        $tamperingIndicators = [];

        // Check if medicine data matches
        if ($submittedData['medicine_name'] !== $seal->medicine->Name) {
            $tamperingIndicators[] = 'Medicine name mismatch';
        }

        // Check if seal has been used more than expected
        if ($seal->scans->count() > 1) {
            $tamperingIndicators[] = 'Multiple scans detected - potential duplication attempt';
        }

        // Check for suspicious time gaps
        if ($seal->scans->count() >= 2) {
            $lastScan = $seal->scans->first();
            if ($lastScan->scanned_at->diffInSeconds($lastScan->created_at) > 3600) {
                $tamperingIndicators[] = 'Unusual time gap detected in scan records';
            }
        }

        return [
            'is_tampered' => count($tamperingIndicators) > 0,
            'tampering_indicators' => $tamperingIndicators,
            'verification_status' => $verification['is_valid']
        ];
    }

    /**
     * Prepare data for verification
     */
    private function prepareVerificationData(SealCode $seal, Medicine $medicine): string
    {
        return json_encode([
            'seal_code' => $seal->code,
            'medicine_id' => $medicine->id,
            'medicine_name' => $medicine->Name,
            'medicine_brand' => $medicine->Brand,
            'medicine_generic_name' => $medicine->generic_name ?? null,
            'batch_number' => $seal->batch_number,
            'expiry_date' => $medicine->Expiry_Date,
            'generated_at' => $seal->generated_at->toIso8601String(),
            'quantity_in_stock' => $medicine->Quantity_in_Stock
        ], JSON_UNESCAPED_SLASHES);
    }

    /**
     * Create a verification error response
     */
    private function createVerificationError(string $message, bool $isValid): array
    {
        return [
            'is_valid' => $isValid,
            'status' => 'FAILED',
            'message' => $message
        ];
    }
}
