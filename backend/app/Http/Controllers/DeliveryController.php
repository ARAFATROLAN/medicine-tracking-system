<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Delivery::query();

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            $deliveries = $query->paginate(10);

            return response()->json([
                'status' => true,
                'message' => 'Deliveries retrieved successfully',
                'data' => collect($deliveries->items())->map(function($delivery) {
                    return [
                        'id' => $delivery->id,
                        'prescription_ID' => $delivery->prescription_ID,
                        'Delivered_By' => $delivery->Delivered_By,
                        'Delivery_Date' => $delivery->Delivery_Date,
                        'status' => $delivery->Status,
                        'delivery_date' => $delivery->Delivery_Date,
                        'created_at' => $delivery->created_at?->format('Y-m-d H:i') ?? 'N/A',
                    ];
                })->toArray(),
                'pagination' => [
                    'total' => $deliveries->total(),
                    'per_page' => $deliveries->perPage(),
                    'current_page' => $deliveries->currentPage(),
                    'last_page' => $deliveries->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Delivery index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch deliveries',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'prescription_ID' => 'required|string',
                'Delivered_By' => 'required|string',
                'Delivery_Date' => 'required|string',
                'Status' => 'required|string|in:pending,delivered,cancelled',
            ]);

            $delivery = Delivery::create($validated);

            return response()->json([
                'status' => true,
                'message' => 'Delivery created successfully',
                'data' => [
                    'id' => $delivery->id,
                    'prescription_ID' => $delivery->prescription_ID,
                    'Delivered_By' => $delivery->Delivered_By,
                    'Delivery_Date' => $delivery->Delivery_Date,
                    'status' => $delivery->Status,
                    'created_at' => $delivery->created_at?->format('Y-m-d H:i') ?? 'N/A',
                ]
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Delivery store error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to create delivery',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $delivery = Delivery::find($id);

            if (!$delivery) {
                return response()->json([
                    'status' => false,
                    'message' => 'Delivery not found'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Delivery retrieved successfully',
                'data' => [
                    'id' => $delivery->id,
                    'prescription_ID' => $delivery->prescription_ID,
                    'Delivered_By' => $delivery->Delivered_By,
                    'Delivery_Date' => $delivery->Delivery_Date,
                    'status' => $delivery->Status,
                    'created_at' => $delivery->created_at?->format('Y-m-d H:i') ?? 'N/A',
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Delivery show error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch delivery',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $delivery = Delivery::find($id);

            if (!$delivery) {
                return response()->json([
                    'status' => false,
                    'message' => 'Delivery not found'
                ], 404);
            }

            $validated = $request->validate([
                'prescription_ID' => 'sometimes|string',
                'Delivered_By' => 'sometimes|string',
                'Delivery_Date' => 'sometimes|string',
                'Status' => 'sometimes|string|in:pending,delivered,cancelled',
            ]);

            $delivery->update($validated);

            return response()->json([
                'status' => true,
                'message' => 'Delivery updated successfully',
                'data' => [
                    'id' => $delivery->id,
                    'prescription_ID' => $delivery->prescription_ID,
                    'Delivered_By' => $delivery->Delivered_By,
                    'Delivery_Date' => $delivery->Delivery_Date,
                    'status' => $delivery->Status,
                    'created_at' => $delivery->created_at?->format('Y-m-d H:i') ?? 'N/A',
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Delivery update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update delivery',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $delivery = Delivery::find($id);

            if (!$delivery) {
                return response()->json([
                    'status' => false,
                    'message' => 'Delivery not found'
                ], 404);
            }

            $delivery->delete();

            return response()->json([
                'status' => true,
                'message' => 'Delivery deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Delivery destroy error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete delivery',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Approve a delivery after seal verification
     */
    public function approve(Request $request, string $id)
    {
        try {
            $delivery = Delivery::find($id);

            if (!$delivery) {
                return response()->json([
                    'status' => false,
                    'message' => 'Delivery not found'
                ], 404);
            }

            if ($delivery->Status !== 'pending') {
                return response()->json([
                    'status' => false,
                    'message' => 'Delivery is not in pending status'
                ], 400);
            }

            $validated = $request->validate([
                'seal_code' => 'required|string',
            ]);

            // Verify the seal code
            $medicine = \App\Models\Medicine::where('Seal_Code', $validated['seal_code'])->first();

            if (!$medicine) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid seal code. Medicine not found.',
                ], 404);
            }

            if (!$medicine->seal_verified) {
                return response()->json([
                    'status' => false,
                    'message' => 'Seal code has not been verified. Please verify the seal first.',
                ], 400);
            }

            // Approve the delivery
            $delivery->update([
                'Status' => 'approved',
                'Delivered_By' => $request->user()->name ?? 'Pharmacist',
                'Delivery_Date' => now(),
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Delivery approved successfully after seal verification.',
                'data' => [
                    'id' => $delivery->id,
                    'status' => $delivery->Status,
                    'approved_at' => $delivery->Delivery_Date,
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Delivery approve error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to approve delivery',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
