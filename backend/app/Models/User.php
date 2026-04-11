<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Role;

/**
 * App\Models\User
 *
 * @method \Laravel\Sanctum\NewAccessToken createToken(string $name, array $abilities = [])
 */
class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;


    public function roles() {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()->pluck('name')
            ->map(fn($name) => strtolower($name))
            ->contains(strtolower($role));
    }

    public function hasAnyRole(array $roles): bool
    {
        $normalizedRoles = array_map('strtolower', $roles);

        return $this->roles()->pluck('name')
            ->map(fn($name) => strtolower($name))
            ->intersect($normalizedRoles)
            ->isNotEmpty();
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'contact',
        'specialisation'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $attributes = [
        'specialisation' => 'Doctor', // default in Laravel
        'contact' => null,
    ];
}
