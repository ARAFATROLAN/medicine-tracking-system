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
        Schema::create('Prescriptions', function (Blueprint $table) {
        $table->id();
        $table->string('Patient_ID')->unique();
        $table->string('Doctor_ID')->unique();
        $table->string('Pharmacist_ID');
        $table->string('Date_prescribed');
        $table->string('Status');
        $table->string('Health_status');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
