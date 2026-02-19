<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DeliveryController;

// Public authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('patients', PatientController::class);
});

// Protected API routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('doctors', DoctorController::class);
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('medicines', MedicineController::class);
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::apiResource('deliveries', DeliveryController::class);

    Route::post('/logout', [AuthController::class, 'logout']);
});
