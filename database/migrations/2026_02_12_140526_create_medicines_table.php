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
       Schema::create('Medicines', function (Blueprint $table) {
        $table->id();
        $table->string('Name');
        $table->string('Brand');
        $table->string('Description');
        $table->string('Quantity_in_Stock');
        $table->string('Seal_Code');
        $table->string('Expiry_Date');
      $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
