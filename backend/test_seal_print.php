<?php
// Test script to create a prescription with seal code
require 'vendor/autoload.php';
require 'bootstrap/app.php';

use Illuminate\Support\Facades\DB;
use App\Models\Prescription;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\User;
use App\Models\SealCode;

echo "====================================\n";
echo "Seal Print Test - Creating Test Data\n";
echo "====================================\n\n";

try {
    // Get or create a patient
    $patient = Patient::first();
    if (!$patient) {
        echo "❌ No patients found. Please create a patient first.\n";
        exit(1);
    }
    echo "✅ Using patient: " . $patient->name . "\n";

    // Get or create a medicine with seal code
    $medicine = Medicine::with('sealCodes')->first();
    if (!$medicine) {
        echo "❌ No medicines found. Please create a medicine first.\n";
        exit(1);
    }
    echo "✅ Using medicine: " . $medicine->name . "\n";

    // Get or create a doctor
    $doctor = User::where('specialisation', '!=', null)->first();
    if (!$doctor) {
        echo "❌ No doctors found. Please create a doctor first.\n";
        exit(1);
    }
    echo "✅ Using doctor: " . $doctor->name . "\n";

    // Create prescription
    $prescription = Prescription::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'date_prescribed' => now(),
        'notes' => 'Test prescription for seal print button'
    ]);
    echo "✅ Created prescription ID: " . $prescription->id . "\n";

    // Attach medicine to prescription
    $prescription->medicines()->attach($medicine->id, [
        'quantity' => 1,
        'dosage' => '250mg twice daily'
    ]);
    echo "✅ Attached medicine to prescription\n";

    // Check for seal codes
    $sealCode = SealCode::where('medicine_id', $medicine->id)
        ->where('is_used', false)
        ->first();

    if ($sealCode) {
        echo "✅ Found available seal code: " . $sealCode->code . "\n";
        echo "   - QR Data: " . (strlen($sealCode->qr_code_data ?? '') > 0 ? "✅ Present" : "❌ Missing") . "\n";
    } else {
        echo "⚠️  No unused seal codes for this medicine\n";
        echo "   Creating a test seal code...\n";
        
        $sealCode = SealCode::create([
            'medicine_id' => $medicine->id,
            'code' => 'SEAL-' . strtoupper(uniqid()),
            'is_used' => false,
            'qr_code_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        ]);
        echo "✅ Created seal code: " . $sealCode->code . "\n";
    }

    echo "\n====================================\n";
    echo "Test Data Created Successfully!\n";
    echo "====================================\n";
    echo "Now refresh your browser and:\n";
    echo "1. Login to admin dashboard\n";
    echo "2. Click on '📋 Prescriptions' tab\n";
    echo "3. You should see the prescription with seal code\n";
    echo "4. Click '🖨️ Print Seal' button to test\n";
    echo "====================================\n";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    exit(1);
}
