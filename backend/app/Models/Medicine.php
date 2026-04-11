<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $fillable = [
        'name',
        'Name',
        'Brand',
        'brand_name',
        'generic_name',
        'category',
        'strength',
        'dosage_form',
        'barcode',
        'description',
        'Description',
        'Quantity_in_Stock',
        'Seal_Code',
        'Expiry_Date',
        'seal_verified'
    ];

    // Many-to-many with Prescription via pivot table
    public function prescriptions() {
        return $this->belongsToMany(Prescription::class, 'prescription_medicine')
                    ->withPivot('quantity', 'dosage')
                    ->withTimestamps();
    }

    // One-to-one with SealCode
    public function sealCode()
    {
        return $this->hasOne(SealCode::class);
    }

    // One-to-many with MedicineInventory
    public function inventories()
    {
        return $this->hasMany(MedicineInventory::class, 'medicine_id');
    }
}
