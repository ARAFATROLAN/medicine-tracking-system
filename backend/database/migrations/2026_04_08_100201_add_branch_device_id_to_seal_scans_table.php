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
        Schema::table('seal_scans', function (Blueprint $table) {
            $table->foreignId('branch_device_id')->nullable()->after('user_id')->constrained('branch_devices')->onDelete('set null');
            $table->index('branch_device_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seal_scans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_device_id');
        });
    }
};
