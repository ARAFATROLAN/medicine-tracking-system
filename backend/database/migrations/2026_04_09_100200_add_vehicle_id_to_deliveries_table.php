<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            // Only add column if it doesn't exist (for SQLite compatibility)
            if (!Schema::hasColumn('deliveries', 'vehicle_id')) {
                $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // SQLite doesn't support dropping foreign keys easily
        // Just drop the column if it exists
        if (Schema::hasColumn('deliveries', 'vehicle_id')) {
            Schema::table('deliveries', function (Blueprint $table) {
                $table->dropColumn('vehicle_id');
            });
        }
    }
};
