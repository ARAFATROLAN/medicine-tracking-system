<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CryptographicKey extends Model
{
    protected $fillable = [
        'key_type',
        'public_key',
        'private_key',
        'key_hash',
        'algorithm',
        'is_active',
        'activated_at',
        'deactivated_at',
        'created_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'activated_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];

    protected $hidden = [
        'private_key' // Never expose private key in API responses
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function getActiveSigningKey()
    {
        return self::where('key_type', 'seal_signing_key')
            ->where('is_active', true)
            ->latest('activated_at')
            ->first();
    }

    public static function getActiveVerificationKey()
    {
        return self::where('key_type', 'seal_verification_key')
            ->where('is_active', true)
            ->latest('activated_at')
            ->first();
    }
}
