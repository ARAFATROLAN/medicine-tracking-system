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
        Schema::create('vehicle_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('accuracy', 8, 2)->nullable(); // in meters
            $table->decimal('speed', 8, 2)->nullable(); // in km/h
            $table->decimal('heading', 6, 2)->nullable(); // in degrees
            $table->decimal('altitude', 10, 2)->nullable(); // in meters
            $table->timestamp('timestamp')->useCurrent();
            $table->string('address')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'timestamp']);
            $table->index('timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_locations');
    }
};
