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
        Schema::create('Medicine_Prescription', function (Blueprint $table) {
        $table->id();
        $table->string('Prescription_ID');
        $table->string('Medicine_ID');
        $table->string('Quantity');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_prescription');
    }
};
