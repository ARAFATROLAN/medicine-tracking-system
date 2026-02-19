<?php

namespace App\Http\Controllers;

use App\Repositories\PrescriptionRepository; // FIX: Capital A in App
use Illuminate\Http\Request;
use App\Http\Resources\PrescriptionResource;

class PrescriptionController extends Controller
{
    protected $repository;

    public function __construct(PrescriptionRepository $repository)
    {
        $this->repository = $repository;
    }

    // ISSUE PRESCRIPTION
    public function store(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medicines' => 'required|array',
            'medicines.*.id' => 'required|exists:medicines,id',
            'medicines.*.quantity' => 'required|integer|min:1',
            'medicines.*.dosage' => 'required|string',
        ]);

        // Call repository
        $prescription = $this->repository->create(
            $validated,
            $request->user()->id
        );

        return response()->json([
            'status' => true,
            'message' => 'Prescription created successfully',
            'data' => new PrescriptionResource(
                $prescription->load('medicines', 'patient', 'doctor')
            )
        ], 201);
    }
}
