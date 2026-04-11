<?php

namespace App\Services;

use App\Models\SealCode;
use App\Models\Medicine;
use App\Models\CryptographicKey;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SealGenerationService
{
    /**
     * Generate a new cryptographically signed seal for a medicine
     *
     * @param Medicine $medicine
     * @param string $batchNumber
     * @param string $locationGenerated
     * @return SealCode
     */
    public function generateSeal(Medicine $medicine, string $batchNumber = null, string $locationGenerated = null): SealCode
    {
        // Generate unique seal code
        $sealCode = $this->generateUniqueSealCode();
        
        // Get active signing key
        $signingKey = CryptographicKey::getActiveSigningKey();
        
        if (!$signingKey) {
            throw new \Exception('No active signing key available for seal generation');
        }

        // Create the data to be signed
        $dataToSign = $this->prepareDataForSigning($medicine, $sealCode, $batchNumber ?? $medicine->id);
        
        // Generate HMAC-SHA256 signature
        $signature = $this->generateSignature($dataToSign, $signingKey->private_key);
        
        // Create QR code payload
        $qrPayload = $this->createQRPayload($medicine, $sealCode, $signature, $batchNumber);
        
        // Create the seal code record
        $seal = SealCode::create([
            'code' => $sealCode,
            'medicine_id' => $medicine->id,
            'signature' => $signature,
            'public_key_hash' => hash('sha256', $signingKey->public_key),
            'generated_at' => Carbon::now(),
            'qr_code_data' => $qrPayload,
            'batch_number' => $batchNumber ?? $medicine->id,
            'location_generated' => $locationGenerated ?? config('app.pharmacy_location', 'Main Pharmacy'),
            'is_used' => false
        ]);

        return $seal;
    }

    /**
     * Generate multiple seals for bulk medicine batches
     *
     * @param Medicine $medicine
     * @param int $quantity
     * @param string $batchNumber
     * @param string $locationGenerated
     * @return array
     */
    public function generateBulkSeals(
        Medicine $medicine,
        int $quantity,
        string $batchNumber = null,
        string $locationGenerated = null
    ): array {
        $seals = [];
        $batchNumber = $batchNumber ?? $medicine->id . '-' . Carbon::now()->timestamp;
        
        for ($i = 0; $i < $quantity; $i++) {
            $seals[] = $this->generateSeal($medicine, $batchNumber, $locationGenerated);
        }
        
        return $seals;
    }

    /**
     * Generate a unique seal code
     */
    private function generateUniqueSealCode(): string
    {
        do {
            $code = 'SEAL-' . strtoupper(Str::random(12)) . '-' . time();
        } while (SealCode::where('code', $code)->exists());
        
        return $code;
    }

    /**
     * Prepare medicine data for cryptographic signing
     */
    private function prepareDataForSigning(Medicine $medicine, string $sealCode, string $batchNumber): string
    {
        return json_encode([
            'seal_code' => $sealCode,
            'medicine_id' => $medicine->id,
            'medicine_name' => $medicine->Name,
            'medicine_brand' => $medicine->Brand,
            'medicine_generic_name' => $medicine->generic_name ?? null,
            'batch_number' => $batchNumber,
            'expiry_date' => $medicine->Expiry_Date,
            'generated_at' => Carbon::now()->toIso8601String(),
            'quantity_in_stock' => $medicine->Quantity_in_Stock
        ], JSON_UNESCAPED_SLASHES);
    }

    /**
     * Generate HMAC-SHA256 signature
     */
    private function generateSignature(string $data, string $privateKey): string
    {
        // Use HMAC-SHA256 for signing
        return hash_hmac('sha256', $data, $privateKey, false);
    }

    /**
     * Create QR code payload with all verification information
     */
    private function createQRPayload(Medicine $medicine, string $sealCode, string $signature, $batchNumber): string
    {
        $payload = [
            'v' => '1.0', // Version
            'seal_code' => $sealCode,
            'signature' => $signature,
            'medicine_name' => $medicine->Name,
            'medicine_brand' => $medicine->Brand,
            'expiry_date' => $medicine->Expiry_Date,
            'batch' => $batchNumber ?? $medicine->id,
            'generated_at' => Carbon::now()->toIso8601String(),
            'verify_url' => route('api.seal.verify'),
        ];
        
        return json_encode($payload);
    }
}
