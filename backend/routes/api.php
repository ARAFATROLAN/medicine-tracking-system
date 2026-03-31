<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1.0
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Public Routes
    Route::get('/ping', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Backend is working properly 🚀'
        ]);
    });

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {

        // Return authenticated user info
        Route::get('/user', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'specialisation' => $user->specialisation,
                    'contact' => $user->contact ?? null,
                ]
            ]);
        });

        // Dashboard & Admin Panel
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [DashboardController::class, 'stats']);
            Route::get('/users', [DashboardController::class, 'users']);
            Route::get('/users/{id}', [DashboardController::class, 'getUser']);
            Route::put('/users/{id}', [DashboardController::class, 'updateUser']);
            Route::delete('/users/{id}', [DashboardController::class, 'deleteUser']);

            Route::get('/medicines', [DashboardController::class, 'medicines']);
            Route::get('/medicines/{id}', [DashboardController::class, 'getMedicine']);
            Route::put('/medicines/{id}', [DashboardController::class, 'updateMedicine']);

            Route::get('/deliveries', [DashboardController::class, 'deliveries']);
            Route::get('/deliveries/{id}', [DashboardController::class, 'getDelivery']);
            Route::put('/deliveries/{id}/status', [DashboardController::class, 'updateDeliveryStatus']);

            Route::get('/inventory', [DashboardController::class, 'inventory']);
            Route::put('/inventory/{id}', [DashboardController::class, 'updateInventory']);

            Route::get('/activity-logs', [DashboardController::class, 'activityLogs']);
            Route::get('/notifications', [DashboardController::class, 'notifications']);
            Route::put('/notifications/{id}/read', [DashboardController::class, 'markNotificationRead']);

            Route::get('/reports', [DashboardController::class, 'reports']);
            Route::get('/system-health', [DashboardController::class, 'systemHealth']);
            Route::get('/hospitals', [DashboardController::class, 'hospitals']);
            Route::get('/settings', [DashboardController::class, 'settings']);
        });

        // CRUD Resources
        Route::apiResource('doctors', DoctorController::class);
        Route::apiResource('patients', PatientController::class);
        Route::apiResource('medicines', MedicineController::class);
        Route::apiResource('prescriptions', PrescriptionController::class);
        Route::apiResource('deliveries', DeliveryController::class);

        // Medicine Monitoring
        Route::get('medicines/low-stock', [MedicineController::class, 'lowStock']);
        Route::get('medicines/expired', [MedicineController::class, 'expired']);

        // Reports
        Route::get('reports/monthly-usage', [ReportController::class, 'monthlyMedicineUsage']);
        Route::get('reports/patient-count', [ReportController::class, 'patientCountPerHospital']);
        Route::get('reports/top-medicines', [ReportController::class, 'topMedicines']);
    });
});
