<?php

namespace App\Policies;

use App\Models\Hospita;
use App\Models\User;
use Illuminate\Auth\Access\Response;



    /**
     * Determine whether the user can view any models.
     */
    

namespace App\Policies;

use App\Models\User;
use App\Models\Hospital;

class HospitalPolicy
{
    public function create(User $user)
    {
        return $user->hasRole('super_admin');
    }

    public function update(User $user, Hospital $hospital)
    {
        return $user->hasRole('super_admin');
    }

    public function delete(User $user, Hospital $hospital)
    {
        return $user->hasRole('super_admin');
    }

    public function view(User $user, Hospital $hospital)
    {
        return $user->hospital_id === $hospital->id
               || $user->hasRole('super_admin');
    }
}


