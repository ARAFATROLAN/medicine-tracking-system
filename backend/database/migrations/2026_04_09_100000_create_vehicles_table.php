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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('number_plate')->unique()->index();
            $table->string('vehicle_type'); // e.g., 'ambulance', 'truck', 'van'
            $table->string('driver_name');
            $table->string('driver_contact')->nullable();
            $table->foreignId('hospital_id')->constrained('hospitals')->onDelete('cascade');
            $table->enum('status', ['active', 'inactive', 'maintenance', 'in_transit'])->default('inactive');
            $table->integer('capacity')->default(0); // in units
            $table->timestamp('registration_date')->useCurrent();
            $table->timestamp('last_location_update')->nullable();
            $table->timestamps();
            
            $table->index(['hospital_id', 'status']);
            $table->index('number_plate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
