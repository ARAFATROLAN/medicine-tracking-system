<?php

namespace App\Repositories;

use App\Models\Prescription;

class PrescriptionRepository
{
    public function create(array $data)
    {
        return Prescription::create($data);
    }

    public function find($id)
    {
        return Prescription::with(['patient', 'doctor', 'medicines'])->find($id);
    }

    public function all()
    {
        return Prescription::with(['patient', 'doctor', 'medicines'])->paginate(10);
    }
}
