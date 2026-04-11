<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class VehicleController extends Controller
{
    /**
     * Register a new vehicle
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'number_plate' => 'required|string|unique:vehicles',
            'vehicle_type' => 'required|string|max:50',
            'driver_name' => 'required|string|max:100',
            'driver_contact' => 'nullable|string|max:20',
            'hospital_id' => 'required|exists:hospitals,id',
            'capacity' => 'nullable|integer|min:0',
        ]);

        try {
            $vehicle = Vehicle::create([
                ...$validated,
                'status' => 'inactive',
                'registration_date' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle registered successfully',
                'data' => $vehicle,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register vehicle: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all vehicles (with optional filtering/pagination)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Vehicle::query();

            // Filter by hospital
            if ($request->has('hospital_id')) {
                $query->where('hospital_id', $request->hospital_id);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Search by number plate or driver name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('number_plate', 'like', "%{$search}%")
                      ->orWhere('driver_name', 'like', "%{$search}%");
                });
            }

            $vehicles = $query->with('latestLocation')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $vehicles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve vehicles: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get vehicle by number plate
     */
    public function getByNumberPlate($numberPlate): JsonResponse
    {
        try {
            $vehicle = Vehicle::where('number_plate', $numberPlate)
                ->with(['latestLocation', 'deliveries'])
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $vehicle,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle not found',
            ], 404);
        }
    }

    /**
     * Get vehicle details by ID
     */
    public function show($id): JsonResponse
    {
        try {
            $vehicle = Vehicle::with(['latestLocation', 'deliveries', 'hospital'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $vehicle,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle not found',
            ], 404);
        }
    }

    /**
     * Update vehicle details
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $vehicle = Vehicle::findOrFail($id);

            $validated = $request->validate([
                'vehicle_type' => 'nullable|string|max:50',
                'driver_name' => 'nullable|string|max:100',
                'driver_contact' => 'nullable|string|max:20',
                'status' => 'nullable|in:active,inactive,maintenance,in_transit',
                'capacity' => 'nullable|integer|min:0',
            ]);

            $vehicle->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle updated successfully',
                'data' => $vehicle,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update vehicle: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update vehicle location (real-time tracking)
     */
    public function updateLocation(Request $request, $id): JsonResponse
    {
        try {
            $vehicle = Vehicle::findOrFail($id);

            $validated = $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'accuracy' => 'nullable|numeric',
                'speed' => 'nullable|numeric',
                'heading' => 'nullable|numeric|between:0,360',
                'altitude' => 'nullable|numeric',
                'address' => 'nullable|string',
            ]);

            // Create new location record
            $location = VehicleLocation::create([
                'vehicle_id' => $vehicle->id,
                ...$validated,
                'timestamp' => now(),
            ]);

            // Update vehicle's last location update timestamp
            $vehicle->update(['last_location_update' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Location updated successfully',
                'data' => $location,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update location: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get vehicle location history
     */
    public function getLocationHistory($id, Request $request): JsonResponse
    {
        try {
            $vehicle = Vehicle::findOrFail($id);

            $minutes = $request->get('minutes', 60);
            $locations = VehicleLocation::where('vehicle_id', $vehicle->id)
                ->recentLocations($minutes)
                ->orderBy('timestamp', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'vehicle' => $vehicle,
                    'locations' => $locations,
                    'location_count' => $locations->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve location history: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current location of a vehicle
     */
    public function getCurrentLocation($id): JsonResponse
    {
        try {
            $vehicle = Vehicle::with('latestLocation')->findOrFail($id);

            if (!$vehicle->latestLocation) {
                return response()->json([
                    'success' => false,
                    'message' => 'No location data available for this vehicle',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $vehicle->latestLocation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve current location: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search vehicles by number plate (for quick search)
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (strlen($query) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search query must be at least 2 characters',
                ], 422);
            }

            $vehicles = Vehicle::where('number_plate', 'like', "%{$query}%")
                ->orWhere('driver_name', 'like', "%{$query}%")
                ->with('latestLocation')
                ->limit(10)
                ->get(['id', 'number_plate', 'vehicle_type', 'driver_name', 'status']);

            return response()->json([
                'success' => true,
                'data' => $vehicles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete vehicle
     */
    public function delete($id): JsonResponse
    {
        try {
            $vehicle = Vehicle::findOrFail($id);
            $vehicle->delete();

            return response()->json([
                'success' => true,
                'message' => 'Vehicle deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete vehicle: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get vehicles in transit
     */
    public function inTransit(Request $request): JsonResponse
    {
        try {
            $vehicles = Vehicle::where('status', 'in_transit')
                ->with(['latestLocation', 'deliveries'])
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $vehicles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve in-transit vehicles: ' . $e->getMessage(),
            ], 500);
        }
    }
}
