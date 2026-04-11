<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SealCode extends Model
{
    protected $fillable = [
        'code',
        'is_used',
        'used_at',
        'medicine_id',
        'signature',
        'public_key_hash',
        'generated_at',
        'qr_code_data',
        'batch_number',
        'location_generated'
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'generated_at' => 'datetime',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function scans(): HasMany
    {
        return $this->hasMany(SealScan::class);
    }

    /**
     * Get all verification history for this seal
     */
    public function getVerificationHistory()
    {
        return $this->scans()
            ->orderBy('scanned_at', 'desc')
            ->get();
    }

    /**
     * Check if seal is valid (not used/expired)
     */
    public function isValid(): bool
    {
        return !$this->is_used && $this->medicine && $this->medicine->Expiry_Date > now();
    }
}
