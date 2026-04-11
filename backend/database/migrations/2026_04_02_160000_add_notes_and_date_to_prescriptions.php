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
        // Add notes column and rename date_prescribed to date if needed
        Schema::table('prescriptions', function (Blueprint $table) {
            // Add notes column if it doesn't exist
            if (!Schema::hasColumn('prescriptions', 'notes')) {
                $table->text('notes')->nullable()->after('date_prescribed');
            }
            
            // Add date column if it doesn't exist (for compatibility with model)
            if (!Schema::hasColumn('prescriptions', 'date')) {
                $table->timestamp('date')->nullable()->after('doctor_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            // Drop the columns we added
            if (Schema::hasColumn('prescriptions', 'notes')) {
                $table->dropColumn('notes');
            }
            
            if (Schema::hasColumn('prescriptions', 'date')) {
                $table->dropColumn('date');
            }
        });
    }
};
