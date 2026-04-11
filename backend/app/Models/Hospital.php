<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BranchDevice;

class Hospital extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
    ];

    public function doctors()
    {
        return $this->hasMany(Doctor::class, 'Hospital_ID', 'id');
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }

    public function devices()
    {
        return $this->hasMany(BranchDevice::class);
    }
}
