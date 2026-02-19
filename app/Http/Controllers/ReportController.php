<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use App\Models\Prescription;
use App\Models\Patient;
use App\Models\Medicine;

class ReportController extends Controller
{
    // Monthly medicine usage
    public function monthlyMedicineUsage()
    {
        $report = Prescription::selectRaw('MONTH(prescriptions.created_at) as month, SUM(prescription_medicine.quantity) as total')
            ->join('prescription_medicine', 'prescriptions.id', '=', 'prescription_medicine.prescription_id')
            ->groupByRaw('MONTH(prescriptions.created_at)')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Monthly medicine usage report',
            'data' => $report
        ]);
    }

    // Patient count per hospital
    public function patientCountPerHospital()
    {
        $report = Patient::selectRaw('hospital_id, COUNT(*) as total')
            ->groupBy('hospital_id')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Patient count per hospital',
            'data' => $report
        ]);
    }

    // Top prescribed medicines
    public function topMedicines()
    {
        $report = Prescription::join('prescription_medicine', 'prescriptions.id', '=', 'prescription_medicine.prescription_id')
            ->selectRaw('prescription_medicine.medicine_id, SUM(prescription_medicine.quantity) as total')
            ->groupBy('prescription_medicine.medicine_id')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Top prescribed medicines',
            'data' => $report
        ]);
    }

    // Cached Monthly Usage (fixed)
    public function monthlyUsage()
    {
        $data = Cache::remember('monthly_usage', 3600, function () {
            return $this->monthlyMedicineUsage()->getData()->data;
        });

        return response()->json([
            'status' => true,
            'message' => 'Monthly report',
            'data' => $data
        ]);
    }
}
