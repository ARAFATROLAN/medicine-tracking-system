<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'contact' => $this->contact ?? null,
            'hospital_id' => $this->hospital_id,
            'created_at' => $this->created_at?->format('Y-m-d H:i') ?? 'N/A',
        ];
    }
}
