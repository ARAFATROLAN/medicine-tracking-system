<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchDevice extends Model
{
    protected $fillable = [
        'hospital_id',
        'registered_by',
        'name',
        'identifier',
        'token',
        'location',
        'is_active',
        'last_used_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function hospital()
    {
        return $this->belongsTo(Hospital::class);
    }

    public function registeredBy()
    {
        return $this->belongsTo(User::class, 'registered_by');
    }
}
