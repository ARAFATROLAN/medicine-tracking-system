<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
  public function prescriptions() {
    return $this->belongsToMany(Prescription::class, 'prescription_medicine')
                ->withPivot('quantity', 'dosage');
}

public function inventories() {
    return $this->hasMany(MedicineInventory::class);
}


    protected $fillable = [
    'name',
    'generic_name',
    'brand_name',
    'strength',
    'dosage_form',
    'barcode',
    'description'
];

}
