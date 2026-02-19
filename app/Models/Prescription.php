<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use illuminate\Support\Facades\Log;

class Prescription extends Model
{
    public function patient() {
    return $this->belongsTo(Patient::class);
}

public function doctor() {
    return $this->belongsTo(User::class, 'doctor_id');
}

public function medicines() {
    return $this->belongsToMany(Medicine::class, 'prescription_medicine')
                ->withPivot('quantity', 'dosage'); // pivot attributes
}

protected static function booted()
{
    static::created(function ($prescription) {
        Log::info('Prescription created', ['id' => $prescription->id, 'doctor_id' => $prescription->doctor_id]);
    });

    static::updated(function ($prescription) {
        Log::info('Prescription updated', ['id' => $prescription->id]);
    });

    static::deleted(function ($prescription) {
        Log::info('Prescription deleted', ['id' => $prescription->id]);
    });
}


}
