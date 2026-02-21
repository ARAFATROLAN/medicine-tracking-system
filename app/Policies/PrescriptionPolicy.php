<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PrescriptionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function create(User $user)
{
    return $user->hasRole('doctor');
}

public function update(User $user, Prescription $prescription)
{
    return $user->hasRole('doctor')
        && $user->id === $prescription->doctor_id;
}

public function delete(User $user, Prescription $prescription)
{
    return $user->hasRole('admin');
}

}
