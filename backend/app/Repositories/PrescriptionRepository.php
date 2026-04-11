<?php

namespace App\Repositories;

use App\Models\Prescription;

class PrescriptionRepository
{
    public function create(array $data, $doctorId = null)
    {
        $prescription = Prescription::create([
            'patient_id' => $data['patient_id'],
            'doctor_id' => $doctorId,
            'notes' => $data['notes'] ?? null,
            'date_prescribed' => now()->toDateString(),
        ]);

        // Attach medicines with their quantities and dosage
        if (!empty($data['medicines'])) {
            foreach ($data['medicines'] as $medicine) {
                $prescription->medicines()->attach($medicine['id'], [
                    'quantity' => $medicine['quantity'],
                    'dosage' => $medicine['dosage'],
                ]);
            }
        }

        return $prescription;
    }

    public function find($id)
    {
        return Prescription::with(['patient', 'doctor', 'medicines'])->find($id);
    }

    public function all($doctorId = null)
    {
        $query = Prescription::with(['patient', 'doctor', 'medicines']);
        
        // Filter by doctor if provided (for doctor dashboard)
        if ($doctorId !== null) {
            $query->where('doctor_id', $doctorId);
        }
        
        return $query->paginate(10);
    }

    public function allForDoctor($doctorId)
    {
        return $this->all($doctorId);
    }
}
