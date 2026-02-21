<?php

namespace App\Policies;

use App\Models\Delivery;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DeliveryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function update(User $user, Delivery $delivery)
{
    return $user->hasRole('pharmacist')
        && $user->id === $delivery->pharmacist_id;
}

}
