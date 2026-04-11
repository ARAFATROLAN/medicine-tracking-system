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
        // Drop the old medicine_prescription table if it exists
        // The new prescription_medicine table (with proper foreign keys) is the correct one
        if (Schema::hasTable('medicine_prescription')) {
            Schema::dropIfExists('medicine_prescription');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // If needed, recreate the old table, but this shouldn't be necessary
        // as prescription_medicine is the correct implementation
    }
};
