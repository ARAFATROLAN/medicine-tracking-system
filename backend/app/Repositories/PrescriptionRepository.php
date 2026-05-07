<?php

namespace App\Repositories;

use App\Models\Prescription;
use App\Models\Medicine;
use Illuminate\Support\Facades\DB;

class PrescriptionRepository
{
    public function create(array $data, $doctorId = null)
    {
        return DB::transaction(function () use ($data, $doctorId) {
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

                    // Reduce stock level of the medicine
                    $medicineModel = Medicine::find($medicine['id']);
                    if ($medicineModel) {
                        $currentStock = $medicineModel->Quantity_in_Stock ?? 0;
                        $newStock = max(0, $currentStock - $medicine['quantity']); // Prevent negative stock

                        $medicineModel->update([
                            'Quantity_in_Stock' => $newStock
                        ]);
                    }
                }
            }

            return $prescription;
        });
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
