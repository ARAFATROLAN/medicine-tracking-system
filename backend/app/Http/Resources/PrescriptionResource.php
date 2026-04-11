<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'doctor_id' => $this->doctor_id,
            'patient_name' => $this->patient?->name ?? 'Unknown',
            'doctor_name' => $this->doctor?->name ?? 'Unknown',
            'medicines' => $this->medicines ? $this->medicines->map(function($med) {
                return [
                    'id' => $med->id,
                    'name' => $med->name,
                    'quantity' => $med->pivot?->quantity ?? 0,
                    'dosage' => $med->pivot?->dosage ?? 'N/A',
                ];
            })->toArray() : [],
            'notes' => $this->notes,
            'date' => $this->date,
            'created_at' => $this->created_at?->format('Y-m-d H:i') ?? 'N/A',
        ];
    }
}
