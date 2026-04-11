<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SealCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 100; $i++) {
            \App\Models\SealCode::create([
                'code' => 'SEAL-' . strtoupper(\Illuminate\Support\Str::random(8)) . '-' . time() . '-' . $i,
            ]);
        }
    }
}
