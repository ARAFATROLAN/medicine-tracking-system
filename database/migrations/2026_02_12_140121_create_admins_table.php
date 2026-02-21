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
        Schema::create('Administrator', function (Blueprint $table) {
        $table->id();
        $table->string('F_name');
        $table->string('L_name');
        $table->string('email')->unique();
        $table->string('phone')->nullable();
        $table->string('role');
        $table->timestamps();
        $table->string('password');
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
