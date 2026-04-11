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
        Schema::table('patients', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['hospital_id']);
            // Make hospital_id nullable
            $table->unsignedBigInteger('hospital_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Revert back to non-nullable
            $table->unsignedBigInteger('hospital_id')->nullable(false)->change();
        });
    }
};
