<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MedicineController extends Controller
{
    /**
     * Register a new medicine with batch number, category, and expiry date
     * Generates a unique seal number and requests delivery if stock is low
     */
    public function registerMedicine(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'batch_number' => 'required|string|max:100',
                'category' => 'required|string|max:100',
                'expiry_date' => 'required|date',
                'quantity' => 'required|integer|min:1',
                'brand' => 'nullable|string|max:255',
                'description' => 'nullable|string',
            ]);

            // Generate unique seal code
            $sealCode = $this->generateUniqueSealCode();

            // Create seal code record
            $sealCodeRecord = \App\Models\SealCode::create([
                'code' => $sealCode,
                'medicine_id' => null, // Will be set after medicine creation
                'is_used' => false,
                'generated_at' => now(),
                'batch_number' => $validated['batch_number'],
                'location_generated' => 'pharmacy_registration',
            ]);

            // Create medicine
            $medicine = Medicine::create([
                'Name' => $validated['name'],
                'Brand' => $validated['brand'] ?? 'N/A',
                'category' => $validated['category'],
                'Description' => $validated['description'] ?? '',
                'Seal_Code' => $sealCode,
                'Expiry_Date' => $validated['expiry_date'],
                'Quantity_in_Stock' => $validated['quantity'],
            ]);

            // Update seal code with medicine_id
            $sealCodeRecord->update([
                'medicine_id' => $medicine->id,
            ]);

            // Create inventory record
            $inventory = MedicineInventory::create([
                'medicine_id' => $medicine->id,
                'batch_number' => $validated['batch_number'],
                'quantity' => $validated['quantity'],
                'expiry_date' => $validated['expiry_date'],
            ]);

            // Check stock level and create delivery request if needed
            $minimumStockLevel = 20; // Default minimum stock
            if ($validated['quantity'] < $minimumStockLevel) {
                Delivery::create([
                    'prescription_ID' => null,
                    'Status' => 'pending',
                    'Delivery_Date' => now(),
                    'Delivered_By' => null,
                    'notes' => 'Auto-generated delivery request for low stock. Medicine: ' . $medicine->Name . ', Required qty: ' . ($minimumStockLevel - $validated['quantity']),
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Medicine registered successfully',
                'data' => [
                    'id' => $medicine->id,
                    'name' => $medicine->Name,
                    'category' => $medicine->category,
                    'batch_number' => $validated['batch_number'],
                    'seal_code' => $sealCode,
                    'expiry_date' => $medicine->Expiry_Date,
                    'quantity' => $medicine->Quantity_in_Stock,
                ]
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Medicine registration error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to register medicine',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function index()
    {
        $medicines = Medicine::paginate(10);
        return response()->json([
            'status' => true,
            'message' => 'Medicines retrieved successfully',
            'data' => collect($medicines->items())->map(function($medicine) {
                return [
                    'id' => $medicine->id,
                    'name' => $medicine->Name,
                    'stock' => $medicine->Quantity_in_Stock ?? 0,
                    'quantity' => $medicine->Quantity_in_Stock ?? 0,
                    'expiry_date' => $medicine->Expiry_Date ?? 'N/A',
                    'created_at' => $medicine->created_at?->format('Y-m-d H:i') ?? 'N/A',
                ];
            })->toArray(),
            'pagination' => [
                'total' => $medicines->total(),
                'per_page' => $medicines->perPage(),
                'current_page' => $medicines->currentPage(),
                'last_page' => $medicines->lastPage(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $medicine = Medicine::create($request->all());
        return response()->json($medicine, 201);
    }

    public function show($id)
    {
        $medicine = Medicine::findOrFail($id);
        return response()->json($medicine, 200);
    }

    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);
        $medicine->update($request->all());
        return response()->json($medicine, 200);
    }

    public function destroy($id)
    {
        Medicine::destroy($id);
        return response()->json(['message' => 'Deleted successfully'], 200);
    }

    public function lowStock()
{
    $medicines = Medicine::where('Quantity_in_Stock', '<=', 5)->get();
    return response()->json([
        'status' => true,
        'message' => 'Low stock medicines',
        'data' => $medicines
    ]);
}

    public function expired()
{
    $medicines = Medicine::where('Expiry_Date', '<', now())->get();
    return response()->json([
        'status' => true,
        'message' => 'Expired medicines',
        'data' => $medicines
    ]);
}

    /**
     * Verify the seal code for a medicine before approval
     */
    public function verifySeal(Request $request)
    {
        try {
            $validated = $request->validate([
                'seal_code' => 'required|string',
            ]);

            $medicine = Medicine::where('Seal_Code', $validated['seal_code'])->first();

            if (!$medicine) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid seal code. Medicine not found.',
                ], 404);
            }

            if ($medicine->seal_verified) {
                return response()->json([
                    'status' => false,
                    'message' => 'Seal code has already been verified. Medicine may have been tampered with or already approved.',
                ], 400);
            }

            // Mark as verified
            $medicine->update(['seal_verified' => true]);

            return response()->json([
                'status' => true,
                'message' => 'Seal code verified successfully. Medicine is authentic and not tampered with.',
                'data' => [
                    'id' => $medicine->id,
                    'name' => $medicine->Name,
                    'seal_code' => $medicine->Seal_Code,
                    'verified_at' => now()->toISOString(),
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Seal verification error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to verify seal code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a unique seal code
     */
    private function generateUniqueSealCode(): string
    {
        do {
            $code = 'SEAL-' . strtoupper(Str::random(8));
        } while (\App\Models\SealCode::where('code', $code)->exists());

        return $code;
    }
}

