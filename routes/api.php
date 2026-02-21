<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ReportController;

// Public authentication routes


/*
Versioned API (v1)
*/

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Prescription
    Route::post('prescriptions', [PrescriptionController::class, 'store']);

    // Reports
    Route::get('reports/monthly-usage', [ReportController::class, 'monthlyUsage']);
});


/*
Existing Protected API routes (Sanctum)
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('doctors', DoctorController::class);
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('medicines', MedicineController::class);
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::apiResource('deliveries', DeliveryController::class);

    Route::post('/logout', [AuthController::class, 'logout']);
});


/*
protected routes for medicine stock and reports
*/
Route::get('medicines/low-stock', [MedicineController::class, 'lowStock'])
    ->middleware('auth:sanctum');

Route::get('medicines/expired', [MedicineController::class, 'expired'])
    ->middleware('auth:sanctum');

Route::get('reports/monthly-usage', [ReportController::class, 'monthlyMedicineUsage'])
    ->middleware('auth:sanctum');

Route::get('reports/patient-count', [ReportController::class, 'patientCountPerHospital'])
    ->middleware('auth:sanctum');

Route::get('reports/top-medicines', [ReportController::class, 'topMedicines'])
    ->middleware('auth:sanctum');
