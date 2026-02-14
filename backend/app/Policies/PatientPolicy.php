<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Auth\Access\Response;

 

    /**
     * Determine whether the user can view any models.
     */
   

namespace App\Policies;

use App\Models\User;
use App\Models\Patient;

class PatientPolicy
{
    public function view(User $user, Patient $patient)
    {
        // Admin can view any patient
        if ($user->hasRole('admin')) {
            return true;
        }

        // Doctor can view only if same hospital
        if ($user->hasRole('doctor') &&
            $user->hospital_id === $patient->hospital_id) {
            return true;
        }

        return false;
    }

    public function update(User $user, Patient $patient)
    {
        // Only admin can update patient
        return $user->hasRole('admin') &&
               $user->hospital_id === $patient->hospital_id;
    }

    public function delete(User $user, Patient $patient)
    {
        return $user->hasRole('admin') &&
               $user->hospital_id === $patient->hospital_id;
    }
}




