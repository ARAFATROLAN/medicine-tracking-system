<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchDevice;
use App\Models\Delivery;
use App\Models\Medicine;
use App\Models\SealCode;
use App\Services\SealGenerationService;
use App\Services\SealVerificationService;
use App\Services\QRCodeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SealController extends Controller
{
    public function __construct(
        protected SealGenerationService $sealService,
        protected SealVerificationService $verificationService,
        protected QRCodeService $qrCodeService
    ) {}

    /**
     * Generate a new seal for a medicine
     * POST /api/seals/generate
     */
    public function generateSeal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'nullable|integer|min:1|max:1000',
            'batch_number' => 'nullable|string|max:255',
            'location_generated' => 'nullable|string|max:255'
        ]);

        try {
            $medicine = Medicine::findOrFail($validated['medicine_id']);
            
            $quantity = $validated['quantity'] ?? 1;
            $batchNumber = $validated['batch_number'] ?? null;
            $location = $validated['location_generated'] ?? null;

            if ($quantity === 1) {
                // Generate single seal
                $seal = $this->sealService->generateSeal($medicine, $batchNumber, $location);
                $seals = [$seal];
            } else {
                // Generate multiple seals
                $seals = $this->sealService->generateBulkSeals($medicine, $quantity, $batchNumber, $location);
            }

            return response()->json([
                'success' => true,
                'message' => 'Seal(s) generated successfully',
                'data' => [
                    'seals' => collect($seals)->map(function ($seal) {
                        $qrCode = $this->qrCodeService->generateQRCode($seal);
                        return [
                            'id' => $seal->id,
                            'code' => $seal->code,
                            'medicine_id' => $seal->medicine_id,
                            'batch_number' => $seal->batch_number,
                            'generated_at' => $seal->generated_at,
                            'is_valid' => $seal->isValid(),
                            'qr_code_url' => $qrCode['qr_code_url'] ?? null,
                        ];
                    }),
                    'total_generated' => count($seals)
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating seal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seal details with verification status
     * GET /api/seals/{sealCode}
     */
    public function getSealDetails($sealCode): JsonResponse
    {
        try {
            $seal = SealCode::where('code', $sealCode)->firstOrFail();
            $verification = $this->verificationService->verifySeal($seal);

            return response()->json([
                'success' => true,
                'data' => array_merge(
                    [
                        'id' => $seal->id,
                        'code' => $seal->code,
                        'medicine' => $seal->medicine->only(['id', 'Name', 'Brand', 'Expiry_Date', 'generic_name', 'strength']),
                        'generated_at' => $seal->generated_at,
                        'batch_number' => $seal->batch_number,
                        'location_generated' => $seal->location_generated,
                        'is_used' => $seal->is_used,
                        'used_at' => $seal->used_at
                    ],
                    $verification
                )
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Seal not found or error retrieving details'
            ], 404);
        }
    }

    /**
     * Verify a seal's authenticity
     * POST /api/seals/verify
     */
    public function verifySeal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'seal_code' => 'required|exists:seal_codes,code',
            'device_token' => 'nullable|string|exists:branch_devices,token',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'device_info' => 'nullable|string'
        ]);

        try {
            $user = Auth::user();
            if (!$user || !$user instanceof \App\Models\User) {
                return response()->json([
                    'success' => false,
                    'status' => 'UNAUTHORIZED',
                    'message' => 'Authorized user context is required to perform seal scans.'
                ], 403);
            }

            if ($user->hasRole('pharmacist')) {
                return response()->json([
                    'success' => false,
                    'status' => 'UNAUTHORIZED',
                    'message' => 'Pharmacists are not allowed to perform seal scans.'
                ], 403);
            }

            $seal = SealCode::where('code', $validated['seal_code'])->firstOrFail();
            $branchDevice = null;
            $scanLocation = $validated['location'] ?? null;
            $deviceInfo = $validated['device_info'] ?? null;

            if (!empty($validated['device_token'])) {
                $branchDevice = BranchDevice::where('token', $validated['device_token'])->first();
                if ($branchDevice) {
                    $scanLocation = $scanLocation ?: $branchDevice->location;
                    $deviceInfo = $deviceInfo ?: $branchDevice->identifier;
                }
            }

            if ($branchDevice && !$branchDevice->is_active) {
                return response()->json([
                    'success' => false,
                    'status' => 'UNAUTHORIZED',
                    'message' => 'Device is not registered or is inactive. Scan may only be performed using registered branch devices.'
                ], 403);
            }

            $scan = $this->verificationService->recordScan($seal, [
                'user_id' => $user->id,
                'branch_device_id' => $branchDevice?->id,
                'location' => $scanLocation,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'ip_address' => $request->ip(),
                'device_info' => $deviceInfo,
                'scanned_at' => now()
            ]);

            $verification = $this->verificationService->verifySeal($seal);

            $pendingDelivery = Delivery::where('status', 'pending')
                ->latest()
                ->first();

            return response()->json([
                'success' => $verification['is_valid'],
                'status' => $verification['status'],
                'message' => $verification['message'],
                'data' => array_merge(
                    [
                        'seal_code' => $seal->code,
                        'medicine' => $seal->medicine->only(['id', 'Name', 'Brand', 'Expiry_Date']),
                        'scanned_at' => $scan->scanned_at,
                        'scan_location' => $scan->location,
                        'batch_number' => $seal->batch_number,
                        'expiry_date' => $seal->medicine->Expiry_Date,
                        'is_expired' => $seal->medicine->Expiry_Date < now(),
                        'branch_device' => $branchDevice?->only(['id', 'name', 'identifier', 'location']),
                        'pending_delivery_id' => $pendingDelivery?->id,
                    ],
                    $verification
                )
            ], $verification['is_valid'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'FAILED',
                'message' => 'Verification error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get QR code for a seal
     * GET /api/seals/{sealCode}/qr-code
     */
    public function getQRCode($sealCode): JsonResponse
    {
        try {
            $seal = SealCode::where('code', $sealCode)->firstOrFail();
            $qrCode = $this->qrCodeService->generateQRCode($seal);

            return response()->json([
                'success' => true,
                'data' => $qrCode
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating QR code'
            ], 500);
        }
    }

    /**
     * Get printable seal label
     * GET /api/seals/{sealCode}/print
     */
    public function getPrintableSeal($sealCode): JsonResponse
    {
        try {
            $seal = SealCode::where('code', $sealCode)->firstOrFail();
            $printable = $this->qrCodeService->generatePrintableSeal($seal);

            return response()->json([
                'success' => true,
                'data' => $printable
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating printable seal'
            ], 500);
        }
    }

    /**
     * Get seal audit trail
     * GET /api/seals/{sealCode}/audit
     */
    public function getAuditTrail($sealCode): JsonResponse
    {
        try {
            $seal = SealCode::where('code', $sealCode)->firstOrFail();
            $audit = $this->verificationService->getAuditTrail($seal);

            return response()->json([
                'success' => true,
                'data' => $audit
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving audit trail'
            ], 500);
        }
    }

    /**
     * Detect tampering
     * POST /api/seals/detect-tampering
     */
    public function detectTampering(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'seal_code' => 'required|exists:seal_codes,code',
            'medicine_name' => 'required|string'
        ]);

        try {
            $seal = SealCode::where('code', $validated['seal_code'])->firstOrFail();
            $tampering = $this->verificationService->detectTampering($seal, $validated);

            return response()->json([
                'success' => true,
                'data' => $tampering
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error detecting tampering'
            ], 500);
        }
    }

    /**
     * Get seals for a medicine
     * GET /api/medicines/{medicineId}/seals
     */
    public function getMedicineSeals($medicineId): JsonResponse
    {
        try {
            $medicine = Medicine::findOrFail($medicineId);
            $seals = $medicine->sealCode()
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $seals
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], 404);
        }
    }
}
