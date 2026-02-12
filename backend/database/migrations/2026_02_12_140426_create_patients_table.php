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
       Schema::create('patients', function (Blueprint $table) {
        $table->Hospital_id();
        $table->string('Name');
        $table->string('Email')->unique();
        $table->string('Phone');
        $table->string('Address');
        $table->string('Date_of_Birth');
        $table->string('Health_status');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
