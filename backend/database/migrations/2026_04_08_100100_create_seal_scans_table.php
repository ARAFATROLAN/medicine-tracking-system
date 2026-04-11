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
        Schema::create('seal_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seal_code_id')->constrained('seal_codes')->onDelete('cascade');
            $table->foreignId('medicine_id')->constrained('medicines')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Who scanned
            $table->timestamp('scanned_at');
            $table->string('location')->nullable(); // Where it was scanned (pharmacy, hospital, delivery point, etc.)
            $table->string('location_latitude')->nullable(); // GPS latitude if available
            $table->string('location_longitude')->nullable(); // GPS longitude if available
            $table->string('ip_address')->nullable(); // IP address of scan device
            $table->string('device_info')->nullable(); // Device identifier/type
            $table->boolean('verification_status')->default(false); // Was cryptographic verification successful
            $table->text('verification_error')->nullable(); // Error message if verification failed
            $table->longText('qr_payload')->nullable(); // Full QR payload that was scanned
            $table->timestamps();
            
            // Indices for querying
            $table->index('seal_code_id');
            $table->index('medicine_id');
            $table->index('scanned_at');
            $table->index('verification_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seal_scans');
    }
};
