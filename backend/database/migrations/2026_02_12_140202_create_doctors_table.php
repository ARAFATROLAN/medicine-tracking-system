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
       Schema::create('doctors', function (Blueprint $table) {
           $table->engine = 'InnoDB';
        $table->id();
        $table->string('F_name');
        $table->string('L_name');
        $table->string('email')->unique();
        $table->string('phone');
        $table->string('specialisation');
        $table->string('Hospital_ID');
        $table->timestamps();
        $table->string('password');
       });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
