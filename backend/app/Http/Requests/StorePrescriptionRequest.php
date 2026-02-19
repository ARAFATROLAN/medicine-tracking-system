<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
       return [
        'patient_id' => 'required|exists:patients,id',
        'medicines' => 'required|array',
        'medicines.*.id' => 'required|exists:medicines,id',
        'medicines.*.quantity' => 'required|integer|min:1',
        'medicines.*.dosage' => 'required|string',
       ];
    }

       // Logic to create prescription and attach medicines
     public function store(StorePrescriptionRequest $request)
{
    $validated = $request->validated();


}



}
