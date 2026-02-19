<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use illuminate\Support\Facades\Log;

class Prescription extends Model
{
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

<<<<<<< HEAD
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


=======
    public function medicines() {
        return $this->belongsToMany(Medicine::class, 'prescription_medicine')
                    ->withPivot('quantity', 'dosage')
                    ->withTimestamps();
    }
>>>>>>> 28bdae13abe5632ab2bfe4a4b4e1506996dc1d1a
}
