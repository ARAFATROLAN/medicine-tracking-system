<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DeliveryController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

#Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('doctors', DoctorController::class);
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('medicines', MedicineController::class);
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::apiResource('deliveries', DeliveryController::class);
    #Route::apiResource('medicines', MedicineController::class);

    Route::post('/logout', [AuthController::class, 'logout']);
#});
