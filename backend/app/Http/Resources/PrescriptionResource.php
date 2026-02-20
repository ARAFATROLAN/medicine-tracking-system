<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'patient' => $this->patient->name,
            'doctor' => $this->doctor->name,
            'medicines' => $this->medicines->map(function($med) {
                return [
                    'name' => $med->name,
                    'quantity' => $med->pivot->quantity,
                    'dosage' => $med->pivot->dosage,
                ];
            }),
            'created_at' => $this->created_at->format('Y-m-d H:i'),
        ];
    }
}
