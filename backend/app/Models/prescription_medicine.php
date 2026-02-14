<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Prescription;
use App\Models\Medicine;

class PrescriptionMedicine extends Model
{
    use HasFactory;

    protected $table = 'prescription_medicine';

    protected $fillable = [
        'prescription_id',
        'medicine_id',
        'quantity',
        'dosage'
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
