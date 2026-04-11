<?php

namespace App\Services;

use App\Models\SealCode;
use App\Models\Medicine;

class QRCodeService
{
    /**
     * Generate QR code for a seal
     * This uses a simple implementation that can work with external services
     * Install: composer require endroid/qr-code
     *
     * @param SealCode $seal
     * @return array
     */
    public function generateQRCode(SealCode $seal): array
    {
        $medicine = $seal->medicine;
        
        // QR code payload with all verification information
        $payload = [
            'v' => '1.0',
            'seal_code' => $seal->code,
            'signature' => $seal->signature,
            'medicine_name' => $medicine->Name,
            'medicine_brand' => $medicine->Brand,
            'medicine_generic_name' => $medicine->generic_name ?? null,
            'expiry_date' => $medicine->Expiry_Date,
            'batch' => $seal->batch_number,
            'generated_at' => $seal->generated_at->toIso8601String(),
            'verify_endpoint' => route('api.seal.verify') . '?code=' . urlencode($seal->code),
        ];

        $qrData = json_encode($payload);

        try {
            // Try to use endroid/qr-code if installed
            if (class_exists('Endroid\QrCode\QrCode')) {
                return $this->generateWithEndroidQRCode($qrData, $seal);
            }
        } catch (\Exception $e) {
            // Fallback to external service or base64 encoding
        }

        // Fallback: Return data for client-side QR generation or external service
        return $this->generateQRDataURI($qrData, $seal);
    }

    /**
     * Generate QR code using Endroid library (if installed)
     */
    private function generateWithEndroidQRCode(string $qrData, SealCode $seal): array
    {
        try {
            $qrCode = new \Endroid\QrCode\QrCode($qrData);
            $qrCode->setSize(300);
            $qrCode->setMargin(10);
            $qrCode->setEncoding('UTF-8');
            $qrCode->setErrorCorrectionLevel(\Endroid\QrCode\ErrorCorrectionLevel::HIGH);
            $qrCode->setRoundBlockSizeMode(\Endroid\QrCode\RoundBlockSizeMode::MARGIN);

            // Generate the QR code as PNG
            $qrCode->setLogoPath(public_path('logo.png')); // Optional: add logo
            
            $filename = 'seals/' . $seal->id . '-qr-code.png';
            $filepath = storage_path('app/public/' . $filename);
            
            if (!is_dir(dirname($filepath))) {
                mkdir(dirname($filepath), 0755, true);
            }

            file_put_contents($filepath, $qrCode->writeString());

            return [
                'success' => true,
                'qr_code_url' => asset('storage/' . $filename),
                'qr_data' => $qrData,
                'format' => 'png'
            ];
        } catch (\Exception $e) {
            return $this->generateQRDataURI($qrData, $seal);
        }
    }

    /**
     * Fallback: Generate QR code as data URI using external API
     * Uses qr-server.com (Google Charts alternative)
     */
    private function generateQRDataURI(string $qrData, SealCode $seal): array
    {
        $encodedData = urlencode($qrData);
        
        // Using qr-server.com API (free, no API key needed)
        $qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . $encodedData;

        return [
            'success' => true,
            'qr_code_url' => $qrImageUrl,
            'qr_data' => $qrData,
            'format' => 'svg',
            'seal_code' => $seal->code,
            'medicine_name' => $seal->medicine->Name,
            'expiry_date' => $seal->medicine->Expiry_Date,
            'batch_number' => $seal->batch_number
        ];
    }

    /**
     * Generate printable seal label with QR code
     *
     * @param SealCode $seal
     * @return array
     */
    public function generatePrintableSeal(SealCode $seal): array
    {
        $qrCode = $this->generateQRCode($seal);
        $medicine = $seal->medicine;

        return [
            'seal_code' => $seal->code,
            'qr_code_url' => $qrCode['qr_code_url'],
            'medicine_name' => $medicine->Name,
            'medicine_brand' => $medicine->Brand,
            'medicine_generic_name' => $medicine->generic_name,
            'strength' => $medicine->strength,
            'dosage_form' => $medicine->dosage_form,
            'expiry_date' => $medicine->Expiry_Date,
            'batch_number' => $seal->batch_number,
            'generated_at' => $seal->generated_at->format('Y-m-d H:i:s'),
            'location' => $seal->location_generated,
            'verification_url' => route('api.seal.verify') . '?code=' . urlencode($seal->code),
            'print_instructions' => 'Print this seal and affix it to the medicine packaging. The QR code can be scanned to verify authenticity.'
        ];
    }

    /**
     * Generate barcode for seal (using Code128 format)
     */
    public function generateBarcode(SealCode $seal): string
    {
        // Using barcode API
        return 'https://barcode.tec-it.com/barcode.ashx?data=' . urlencode($seal->code) . '&code=Code128&unit=Mm&dpi=96&imagetype=gif';
    }
}
