<?php

namespace App\Http\Controllers;

use App\Repositories\PrescriptionRepository; // FIX: Capital A in App
use Illuminate\Http\Request;
use App\Http\Resources\PrescriptionResource;
use App\Models\ActivityLog;
use App\Services\QRCodeService;

class PrescriptionController extends Controller
{
    protected $repository;

    public function __construct(PrescriptionRepository $repository)
    {
        $this->repository = $repository;
    }

    // GET ALL PRESCRIPTIONS
    public function index(Request $request)
    {
        try {
            // Get authenticated user ID - doctors should only see their own prescriptions
            $userId = $request->user()->id;

            $prescriptions = $this->repository->all($userId);

            return response()->json([
                'status' => true,
                'message' => 'Prescriptions retrieved successfully',
                'data' => collect($prescriptions->items())->map(function($prescription) {
                    // Get first available seal code from the medicines in this prescription
                    $sealCode = null;
                    if ($prescription->medicines && $prescription->medicines->count() > 0) {
                        $firstMedicine = $prescription->medicines->first();
                        $sealCodeRecord = \App\Models\SealCode::where('medicine_id', $firstMedicine->id)
                            ->where('is_used', false)
                            ->first();
                        if ($sealCodeRecord) {
                            $qrCodeUrl = null;
                            try {
                                $qrCode = app(QRCodeService::class)->generateQRCode($sealCodeRecord);
                                $qrCodeUrl = $qrCode['qr_code_url'] ?? null;
                            } catch (\Exception $e) {
                                \Log::debug('Failed to generate QR code URL for prescription seal: ' . $e->getMessage());
                            }

                            $sealCode = [
                                'id' => $sealCodeRecord->id,
                                'code' => $sealCodeRecord->code,
                                'qr_code_url' => $qrCodeUrl,
                            ];
                        }
                    }

                    return [
                        'id' => $prescription->id,
                        'patient_id' => $prescription->patient_id,
                        'doctor_id' => $prescription->doctor_id,
                        'patient_name' => $prescription->patient?->name ?? 'Unknown',
                        'doctor_name' => $prescription->doctor?->name ?? 'Unknown',
                        'medicine' => $prescription->medicines ? [
                            'id' => $prescription->medicines->first()?->id,
                            'name' => $prescription->medicines->first()?->name ?? 'N/A'
                        ] : null,
                        'medicines' => $prescription->medicines ? $prescription->medicines->map(function($med) {
                            return [
                                'id' => $med->id,
                                'name' => $med->name,
                                'quantity' => $med->pivot?->quantity ?? 0,
                                'dosage' => $med->pivot?->dosage ?? 'N/A',
                            ];
                        })->toArray() : [],
                        'seal_code' => $sealCode,
                        'status' => $prescription->status ?? 'pending',
                        'notes' => $prescription->notes,
                        'date' => $prescription->date,
                        'created_at' => $prescription->created_at?->format('Y-m-d H:i') ?? 'N/A',
                    ];
                })->toArray(),
                'pagination' => [
                    'total' => $prescriptions->total(),
                    'per_page' => $prescriptions->perPage(),
                    'current_page' => $prescriptions->currentPage(),
                    'last_page' => $prescriptions->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Prescription index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch prescriptions',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    // GET SINGLE PRESCRIPTION
    public function show($id)
    {
        try {
            $prescription = $this->repository->find($id);

            if (!$prescription) {
                return response()->json([
                    'status' => false,
                    'message' => 'Prescription not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Prescription retrieved successfully',
                'data' => new PrescriptionResource($prescription)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // CREATE PRESCRIPTION
    public function store(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medicines' => 'required|array',
            'medicines.*.id' => 'required|exists:medicines,id',
            'medicines.*.quantity' => 'required|integer|min:1',
            'medicines.*.dosage' => 'required|string',
        ]);

        try {
            // Call repository
            $prescription = $this->repository->create(
                $validated,
                $request->user()->id
            );

            // Load relationships before using them
            $prescription->load('medicines', 'patient', 'doctor');

            // Log activity in admin dashboard
            try {
                $medicineNames = $prescription->medicines
                    ->pluck('name')
                    ->join(', ');

                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'action' => "Created prescription for patient {$prescription->patient?->name} with medicines: {$medicineNames}",
                    'entity_type' => 'Prescription',
                    'entity_id' => $prescription->id,
                ]);
            } catch (\Exception $logError) {
                \Log::warning('Failed to log prescription activity: ' . $logError->getMessage());
            }

            return response()->json([
                'status' => true,
                'message' => 'Prescription created successfully',
                'data' => new PrescriptionResource($prescription)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to create prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // UPDATE PRESCRIPTION
    public function update(Request $request, $id)
    {
        try {
            $prescription = $this->repository->find($id);

            if (!$prescription) {
                return response()->json([
                    'status' => false,
                    'message' => 'Prescription not found'
                ], 404);
            }

            $validated = $request->validate([
                'notes' => 'sometimes|nullable|string',
            ]);

            $prescription->update($validated);

            return response()->json([
                'status' => true,
                'message' => 'Prescription updated successfully',
                'data' => new PrescriptionResource($prescription->load('medicines', 'patient', 'doctor'))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // DELETE PRESCRIPTION
    public function destroy($id)
    {
        try {
            $prescription = $this->repository->find($id);

            if (!$prescription) {
                return response()->json([
                    'status' => false,
                    'message' => 'Prescription not found'
                ], 404);
            }

            $prescription->delete();

            return response()->json([
                'status' => true,
                'message' => 'Prescription deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
