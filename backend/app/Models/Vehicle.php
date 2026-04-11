<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'number_plate',
        'vehicle_type',
        'driver_name',
        'driver_contact',
        'hospital_id',
        'status',
        'capacity',
        'registration_date',
        'last_location_update',
    ];

    protected $casts = [
        'registration_date' => 'datetime',
        'last_location_update' => 'datetime',
    ];

    /**
     * Get the hospital that owns the vehicle
     */
    public function hospital()
    {
        return $this->belongsTo(Hospital::class);
    }

    /**
     * Get all location updates for this vehicle
     */
    public function locationUpdates()
    {
        return $this->hasMany(VehicleLocation::class);
    }

    /**
     * Get the latest location
     */
    public function latestLocation()
    {
        return $this->hasOne(VehicleLocation::class)->latestOfMany();
    }

    /**
     * Get all deliveries assigned to this vehicle
     */
    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }
}
