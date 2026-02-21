<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use illuminate\Support\Facades\Log;

class Prescription extends Model {

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'date',
        'notes'
    ];

    public function patient() {
        return $this->belongsTo(Patient::class);
    }

public function doctor() {
    return $this->belongsTo(User::class, 'doctor_id');
}

public function medicines() {
        return $this->belongsToMany(Medicine::class, 'prescription_medicine')
                    ->withPivot('quantity', 'dosage')
                    ->withTimestamps();
    }

}


