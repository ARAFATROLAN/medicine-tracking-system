<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CryptographicKey;
use Carbon\Carbon;

class InitializeCryptographicKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crypto:init';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize cryptographic keys for seal signing and verification';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Check if keys already exist
            $existingKeys = CryptographicKey::where('is_active', true)->count();
            if ($existingKeys > 0) {
                $this->info('Active cryptographic keys already exist. Skipping initialization.');
                return 0;
            }

            // Generate RSA key pair (4096-bit for high security)
            $config = [
                'private_key_bits' => 4096,
                'private_key_type' => OPENSSL_KEYTYPE_RSA,
            ];

            $res = openssl_pkey_new($config);
            openssl_pkey_export($res, $privateKey);
            $publicKeyDetails = openssl_pkey_get_details($res);
            $publicKey = $publicKeyDetails['key'];

            // Create signing key
            $signingKey = CryptographicKey::create([
                'key_type' => 'seal_signing_key',
                'public_key' => $publicKey,
                'private_key' => $privateKey,
                'key_hash' => hash('sha256', $publicKey),
                'algorithm' => 'sha256',
                'is_active' => true,
                'activated_at' => Carbon::now(),
                'created_by' => 1, // System admin
            ]);

            // Also create verification key (same as signing key)
            CryptographicKey::create([
                'key_type' => 'seal_verification_key',
                'public_key' => $publicKey,
                'private_key' => null,
                'key_hash' => hash('sha256', $publicKey),
                'algorithm' => 'sha256',
                'is_active' => true,
                'activated_at' => Carbon::now(),
                'created_by' => 1,
            ]);

            $this->info('✅ Cryptographic keys initialized successfully!');
            $this->info('Signing Key ID: ' . $signingKey->id);
            $this->info('Key Hash: ' . $signingKey->key_hash);
            $this->warn('⚠️ IMPORTANT: Store the private key securely. Do not lose it!');

            return 0;
        } catch (\Exception $e) {
            $this->error('Error initializing cryptographic keys: ' . $e->getMessage());
            return 1;
        }
    }
}
