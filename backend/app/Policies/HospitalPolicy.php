<?php

namespace App\Policies;

use App\Models\Hospital;
use App\Models\User;

class HospitalPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function view(User $user, Hospital $hospital)
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function create(User $user)
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function update(User $user, Hospital $hospital)
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function delete(User $user, Hospital $hospital)
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}


