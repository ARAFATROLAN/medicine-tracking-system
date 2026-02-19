<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    /**
     * Run the migrations.
     */

    public function up(): void
  {
    Schema::create('prescriptions', function (Blueprint $table) {

        $table->id();

        $table->foreignId('patient_id')
              ->constrained('patients')
              ->onDelete('cascade');

        $table->foreignId('doctor_id')
              ->constrained('doctors')
              ->onDelete('cascade');

        $table->foreignId('pharmacist_id')
              ->nullable()
              ->constrained('pharmacists')
              ->onDelete('set null');

        $table->date('date_prescribed');

        $table->string('status')->default('pending');

        $table->string('health_status')->nullable();

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