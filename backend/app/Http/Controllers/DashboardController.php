<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Pharmacist;
use App\Models\Admin;
use App\Models\ActivityLog;
use App\Models\MedicineInventory;
use App\Models\Delivery;
use App\Models\Hospital;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get comprehensive dashboard stats with system overview
     */
    public function stats()
    {
        try {
            // Count totals
            $total_users = User::count();
            $total_doctors = Doctor::count();
            $total_patients = Patient::count();
            $total_pharmacists = Pharmacist::count();
            $total_admins = Admin::count();
            $total_medicines = Medicine::count();
            $total_prescriptions = Prescription::count();

            // Get low stock and expired medicines
            $low_stock_medicines = MedicineInventory::where('quantity', '<', 10)->count();
            $expired_medicines = Medicine::whereNotNull('expiry_date')
                ->where('expiry_date', '<', now())->count();

            // Get deliveries and prescriptions
            $pending_deliveries = Delivery::where('status', 'pending')->count();
            $today_prescriptions = Prescription::whereDate('created_at', now())->count();

            $total_hospitals = Hospital::count();

            // Get recent activities safely
            $recent_activities = [];
            try {
                $recent_activities = ActivityLog::latest()->take(5)->get();
            } catch (\Exception $e) {
                // If ActivityLog fails, just continue without it
                \Log::warning('Failed to fetch activity logs: ' . $e->getMessage());
            }

            return response()->json([
                'total_users' => $total_users,
                'total_doctors' => $total_doctors,
                'total_patients' => $total_patients,
                'total_pharmacists' => $total_pharmacists,
                'total_admins' => $total_admins,
                'total_medicines' => $total_medicines,
                'total_prescriptions' => $total_prescriptions,
                'low_stock_medicines' => $low_stock_medicines,
                'expired_medicines' => $expired_medicines,
                'pending_deliveries' => $pending_deliveries,
                'today_prescriptions' => $today_prescriptions,
                'total_hospitals' => $total_hospitals,
                'recent_activities' => $recent_activities,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => config('app.debug') ? $e->getTrace() : null,
            ], 500);
        }
    }

    /**
     * Get all users with detailed info
     */
    public function users()
    {
        $users = User::with('roles')
            ->select('id', 'name', 'email', 'contact', 'specialisation', 'created_at')
            ->paginate(20);
        return response()->json($users);
    }

    /**
     * Get user with route-model binding
     */
    public function getUser(User $user)
    {
        return response()->json($user);
    }

    /**
     * Update user details (admin only)
     */
    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $user->id,
            'contact' => 'string|nullable',
            'specialisation' => 'string|nullable',
        ]);

        $user->update($validated);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Updated user: ' . $user->name,
            'entity_type' => 'User',
            'entity_id' => $user->id,
        ]);

        return response()->json(['message' => 'User updated successfully', 'data' => $user]);
    }

    /**
     * Delete user (admin only)
     */
    public function deleteUser(User $user)
    {
        $userName = $user->name;
        $user->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Deleted user: ' . $userName,
            'entity_type' => 'User',
            'entity_id' => $user->id,
        ]);

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get medicines with inventory and status
     */
    public function medicines()
    {
        $medicines = Medicine::with(['inventories'])
            ->select('id', 'name', 'description', 'expiry_date', 'created_at')
            ->paginate(20);

        $medicines->getCollection()->transform(function ($medicine) {
            $medicine->stock_status = $this->getStockStatus($medicine);
            return $medicine;
        });

        return response()->json($medicines);
    }

    /**
     * Get medicine details
     */
    public function getMedicine(Medicine $medicine)
    {
        $medicine->load('inventories');
        return response()->json($medicine);
    }

    /**
     * Update medicine
     */
    public function updateMedicine(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'string|nullable',
            'expiry_date' => 'date|nullable',
        ]);
        $medicine->update($validated);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Updated medicine: ' . $medicine->name,
            'entity_type' => 'Medicine',
            'entity_id' => $medicine->id,
        ]);

        return response()->json(['message' => 'Medicine updated successfully', 'data' => $medicine]);
    }

    /**
     * Get all deliveries with filtering
     */
    public function deliveries(Request $request)
    {
        $query = Delivery::with(['prescription', 'pharmacy'])
            ->select('id', 'prescription_id', 'pharmacy_id', 'status', 'created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $deliveries = $query->paginate(20);
        return response()->json($deliveries);
    }

    /**
     * Get delivery details
     */
    public function getDelivery(Delivery $delivery)
    {
        $delivery->load(['prescription', 'pharmacy']);
        return response()->json($delivery);
    }

    /**
     * Update delivery status (approve/reject/complete)
     */
    public function updateDeliveryStatus(Request $request, Delivery $delivery)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,completed',
            'notes' => 'string|nullable',
        ]);

        $oldStatus = $delivery->status;
        $delivery->update($validated);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => "Changed delivery {$delivery->id} status from {$oldStatus} to {$validated['status']}",
            'entity_type' => 'Delivery',
            'entity_id' => $delivery->id,
        ]);

        return response()->json([
            'message' => 'Delivery status updated successfully',
            'data' => $delivery
        ]);
    }

    /**
     * Get inventory management data
     */
    public function inventory()
    {
        $inventory = MedicineInventory::with('medicine')
            ->select('id', 'medicine_id', 'quantity', 'expiry_date', 'location')
            ->paginate(20);

        return response()->json($inventory);
    }

    /**
     * Update inventory
     */
    public function updateInventory(Request $request, MedicineInventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'integer|min:0',
            'location' => 'string|nullable',
            'expiry_date' => 'date|nullable',
        ]);

        $oldQuantity = $inventory->quantity;
        $inventory->update($validated);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => "Updated inventory for medicine {$inventory->medicine_id}: {$oldQuantity} → {$validated['quantity']}",
            'entity_type' => 'MedicineInventory',
            'entity_id' => $inventory->id,
        ]);

        return response()->json([
            'message' => 'Inventory updated successfully',
            'data' => $inventory
        ]);
    }

    /**
     * Get activity logs
     */
    public function activityLogs(Request $request)
    {
        $logs = ActivityLog::select('id', 'user_id', 'action', 'entity_type', 'entity_id', 'created_at')
            ->latest();

        if ($request->has('model')) {
            $logs->where('entity_type', $request->model);
        }

        $logs = $logs->paginate(50);
        return response()->json($logs);
    }

    /**
     * Get notifications
     */
    public function notifications()
    {
        $notifications = \App\Models\Notification::select('id', 'user_id', 'message', 'read_at', 'created_at')
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationRead($id)
    {
        $notification = \App\Models\Notification::findOrFail($id);
        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Get comprehensive analytics and reports
     */
    public function reports()
    {
        $reports = [
            'prescriptions_this_month' => Prescription::whereMonth('created_at', now()->month)->count(),
            'prescriptions_this_year' => Prescription::whereYear('created_at', now()->year)->count(),
            'deliveries_completed' => Delivery::where('status', 'completed')->count(),
            'total_users_registered' => User::count(),
            'new_users_this_month' => User::whereMonth('created_at', now()->month)->count(),
            'medicines_low_stock' => MedicineInventory::where('quantity', '<', 10)->count(),
            'medicines_expired' => Medicine::where('expiry_date', '<', now())->count(),
        ];

        return response()->json($reports);
    }

    /**
     * Get system health metrics
     */
    public function systemHealth()
    {
        try {
            // Calculate disk usage safely
            $disk_usage = 0;
            $disk_total = disk_total_space("/");
            $disk_free = disk_free_space("/");
            if ($disk_total && $disk_free !== false) {
                $disk_usage = round((($disk_total - $disk_free) / $disk_total) * 100, 2);
            }

            // Calculate memory usage safely
            $memory_usage = 0;
            $memory_peak = memory_get_peak_usage();
            $memory_current = memory_get_usage();
            if ($memory_peak > 0) {
                $memory_usage = round(($memory_current / $memory_peak) * 100, 2);
            }

            // Get recent errors safely
            $recent_errors = [];
            try {
                $recent_errors = ActivityLog::where('action', 'like', '%error%')
                    ->latest()
                    ->take(5)
                    ->get();
            } catch (\Exception $e) {
                \Log::warning('Failed to fetch error logs: ' . $e->getMessage());
            }

            $health = [
                'database_status' => $this->checkDatabaseHealth(),
                'api_status' => 'healthy',
                'users_online' => User::count(),
                'recent_errors' => $recent_errors,
                'disk_usage' => $disk_usage,
                'memory_usage' => $memory_usage,
            ];

            return response()->json($health);
        } catch (\Throwable $e) {
            \Log::error('System health check error: ' . $e->getMessage());
            return response()->json([
                'database_status' => 'unknown',
                'api_status' => 'healthy',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get hospital/facility information
     */
    public function hospitals()
    {
        $hospitals = Hospital::select('id', 'name', 'location', 'phone', 'created_at')
            ->withCount('doctors', 'patients')
            ->paginate(20);

        return response()->json($hospitals);
    }

    /**
     * Get dashboard settings (for admins)
     */
    public function settings()
    {
        $settings = [
            'app_name' => env('APP_NAME', 'Medicine Tracking System'),
            'app_version' => '1.0.0',
            'last_backup' => now()->subDays(1),
            'notification_settings' => [
                'low_stock_alert' => 10,
                'expiry_alert_days' => 7,
            ],
        ];

        return response()->json($settings);
    }

    /**
     * Helper: Get stock status
     */
    private function getStockStatus($medicine)
    {
        $totalStock = $medicine->inventories->sum('quantity');

        if ($totalStock < 10) {
            return 'critical';
        } elseif ($totalStock < 50) {
            return 'low';
        } else {
            return 'adequate';
        }
    }

    /**
     * Helper: Check database health
     */
    private function checkDatabaseHealth()
    {
        try {
            DB::connection()->getPdo();
            return 'healthy';
        } catch (\Exception $e) {
            return 'unhealthy';
        }
    }
}
