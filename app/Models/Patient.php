<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    // Mass assignable fields
    protected $fillable = [
        'name',
        'email',
        'hospital_id',
    ];

    // Relationship: Patient belongs to a Hospital
    public function hospital()
    {
        return $this->belongsTo(Hospital::class);
    }
}
