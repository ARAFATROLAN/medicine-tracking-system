<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'dob'
    ];

    // One-to-many with prescriptions
    public function prescriptions() {
        return $this->hasMany(Prescription::class);
    }
}
