<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cryptographic_keys', function (Blueprint $table) {
            $table->id();
            $table->string('key_type'); // 'seal_signing_key', 'seal_verification_key', etc.
            $table->longText('public_key'); // PEM format public key
            $table->longText('private_key')->nullable(); // PEM format private key (only for signing keys)
            $table->string('key_hash')->unique(); // Hash of the key for reference
            $table->string('algorithm')->default('sha256'); // Signing algorithm used
            $table->boolean('is_active')->default(true);
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('deactivated_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('key_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cryptographic_keys');
    }
};
