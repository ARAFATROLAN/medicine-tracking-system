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
App version 1.0
*/

Route::prefix('v1')->group(function () {

    /*
    public routes
    */

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    /*
    Reported routes(Sanctum)
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
        medicine monitoring
        */

        Route::get('medicines/low-stock', [MedicineController::class, 'lowStock']);
        Route::get('medicines/expired', [MedicineController::class, 'expired']);

        /*
        reports
        */

        Route::get('reports/monthly-usage', [ReportController::class, 'monthlyMedicineUsage']);
        Route::get('reports/patient-count', [ReportController::class, 'patientCountPerHospital']);
        Route::get('reports/top-medicines', [ReportController::class, 'topMedicines']);

        Route::get('/test', function () {
    return response()->json([
        'message' => 'Backend is working!'
    ]);
});
    });
});
