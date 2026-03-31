<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineInventory extends Model
{
    protected $table = 'medicine_inventory';

    protected $fillable = [
        'medicine_id',
        'batch_number',
        'quantity',
        'expiry_date',
        'location',
        'supplier'
    ];

    public function medicine() {
        return $this->belongsTo(Medicine::class);
    }
}
