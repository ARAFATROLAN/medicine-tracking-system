<?php

namespace App\Policies;

use App\Models\Medicine;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MedicinePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user)
{
    return $user->hasAnyRole(['admin','doctor','pharmacist']);
}

public function create(User $user)
{
    return $user->hasAnyRole(['admin','pharmacist']);
}

public function update(User $user, Medicine $medicine)
{
    return $user->hasRole('pharmacist')
        && $user->hospital_id === $medicine->hospital_id;
}

public function delete(User $user, Medicine $medicine)
{
    return $user->hasRole('admin');
}

}
