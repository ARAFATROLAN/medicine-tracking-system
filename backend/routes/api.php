<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1.0
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public Routes (No Authentication Required)
    |--------------------------------------------------------------------------
    */

    // Health check route (used to test backend connection)
    Route::get('/ping', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Backend is working properly 🚀'
        ]);
    });

    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);


    /*
    |--------------------------------------------------------------------------
    | Protected Routes (Require Sanctum Authentication)
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        // Logout
        Route::post('/logout', [AuthController::class, 'logout']);

        // Resources
        Route::apiResource('doctors', DoctorController::class);
        Route::apiResource('patients', PatientController::class);
        Route::apiResource('medicines', MedicineController::class);
        Route::apiResource('prescriptions', PrescriptionController::class);
        Route::apiResource('deliveries', DeliveryController::class);

        /*
        |--------------------------------------------------------------------------
        | Medicine Monitoring
        |--------------------------------------------------------------------------
        */

        Route::get('medicines/low-stock', [MedicineController::class, 'lowStock']);
        Route::get('medicines/expired', [MedicineController::class, 'expired']);

        /*
        |--------------------------------------------------------------------------
        | Reports
        |--------------------------------------------------------------------------
        */

        Route::get('reports/monthly-usage', [ReportController::class, 'monthlyMedicineUsage']);
        Route::get('reports/patient-count', [ReportController::class, 'patientCountPerHospital']);
        Route::get('reports/top-medicines', [ReportController::class, 'topMedicines']);
    });
});