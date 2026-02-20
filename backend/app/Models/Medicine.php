<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $fillable = [
        'name',
        'generic_name',
        'brand_name',
        'strength',
        'dosage_form',
        'barcode',
        'description'
    ];

    // Many-to-many with Prescription via pivot table
    public function prescriptions() {
        return $this->belongsToMany(Prescription::class, 'prescription_medicine')
                    ->withPivot('quantity', 'dosage')
                    ->withTimestamps();
    }

    // One-to-many with inventory
    public function inventories() {
        return $this->hasMany(MedicineInventory::class);
    }
}
