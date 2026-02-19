<?php

namespace App\Http\Controllers;

use App\Http\Resources\PatientResource;
use Illuminate\Http\Request;
use App\Models\Patient;

class PatientController extends Controller
{
    // GET ALL PATIENTS
    public function index(Request $request)
    {
        $patients = Patient::paginate(10);

        return response()->json([
            'status' => true,
            'message' => 'Patients retrieved successfully',
            'data' => PatientResource::collection($patients),
        ]);
    }

    // STORE NEW PATIENT
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:patients,email',
            'hospital_id' => 'required|exists:hospitals,id',
        ]);

        $patient = Patient::create($validated);

        return response()->json([
            'status' => true,
            'message' => 'Patient created successfully',
            'data' => new PatientResource($patient),
        ], 201);
    }

    // SHOW SINGLE PATIENT
    public function show($id)
    {
        $patient = Patient::find($id);

        if (!$patient) {
            return response()->json([
                'status' => false,
                'message' => 'Patient not found',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Patient retrieved successfully',
            'data' => new PatientResource($patient),
        ]);
    }

    // UPDATE PATIENT
    public function update(Request $request, $id)
    {
        $patient = Patient::find($id);

        if (!$patient) {
            return response()->json([
                'status' => false,
                'message' => 'Patient not found',
                'data' => null,
            ], 404);
        }

        $patient->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Patient updated successfully',
            'data' => new PatientResource($patient),
        ]);
    }

    // DELETE PATIENT
    public function destroy($id)
    {
        $patient = Patient::find($id);

        if (!$patient) {
            return response()->json([
                'status' => false,
                'message' => 'Patient not found',
                'data' => null,
            ], 404);
        }

        $patient->delete();

        return response()->json([
            'status' => true,
            'message' => 'Patient deleted successfully',
            'data' => null,
        ]);
    }
}
