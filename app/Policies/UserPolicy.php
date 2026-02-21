<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $authUser)
{
    return $authUser->hasRole('admin');
}

public function view(User $authUser, User $user)
{
    return $authUser->hasRole('admin') || $authUser->id === $user->id;
}

public function create(User $authUser)
{
    return $authUser->hasRole('admin');
}

public function update(User $authUser, User $user)
{
    return $authUser->hasRole('admin') || $authUser->id === $user->id;
}

public function delete(User $authUser, User $user)
{
    return $authUser->hasRole('admin');
}

}
