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
        // Enhance seal_codes table with cryptographic fields
        Schema::table('seal_codes', function (Blueprint $table) {
            // Add cryptographic fields
            $table->longText('signature')->nullable()->after('code'); // HMAC-SHA256 signature
            $table->string('public_key_hash')->nullable()->after('signature'); // Hash of public key for verification
            $table->timestamp('generated_at')->nullable()->after('used_at'); // When seal was generated
            $table->string('qr_code_data')->nullable()->after('generated_at'); // QR code payload
            $table->string('batch_number')->nullable()->after('qr_code_data'); // Batch identifier for medicines
            $table->string('location_generated')->nullable()->after('batch_number'); // Where the seal was generated

            // Add indices for performance
            $table->index('batch_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seal_codes', function (Blueprint $table) {
            $table->dropIndex('seal_codes_batch_number_index');
            $table->dropColumn([
                'signature',
                'public_key_hash',
                'generated_at',
                'qr_code_data',
                'batch_number',
                'location_generated'
            ]);
        });
    }
};
