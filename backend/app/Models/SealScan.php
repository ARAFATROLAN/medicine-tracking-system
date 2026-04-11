<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BranchDevice;

class SealScan extends Model
{
    protected $fillable = [
        'seal_code_id',
        'medicine_id',
        'user_id',
        'branch_device_id',
        'scanned_at',
        'location',
        'location_latitude',
        'location_longitude',
        'ip_address',
        'device_info',
        'verification_status',
        'verification_error',
        'qr_payload'
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'verification_status' => 'boolean',
    ];

    public function sealCode()
    {
        return $this->belongsTo(SealCode::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branchDevice()
    {
        return $this->belongsTo(BranchDevice::class);
    }
}
