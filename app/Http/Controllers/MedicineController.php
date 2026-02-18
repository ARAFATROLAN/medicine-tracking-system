<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function index()
    {
        return response()->json(Medicine::all(), 200);
    }

    public function store(Request $request)
    {
        $medicine = Medicine::create($request->all());
        return response()->json($medicine, 201);
    }

    public function show($id)
    {
        $medicine = Medicine::findOrFail($id);
        return response()->json($medicine, 200);
    }

    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);
        $medicine->update($request->all());
        return response()->json($medicine, 200);
    }

    public function destroy($id)
    {
        Medicine::destroy($id);
        return response()->json(['message' => 'Deleted successfully'], 200);
    }
}
