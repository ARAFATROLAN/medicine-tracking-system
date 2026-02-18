<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Import your interfaces and repositories
use App\Interfaces\PatientRepositoryInterface;
use App\Repositories\PatientRepository;
use App\Interfaces\DoctorRepositoryInterface;
use App\Repositories\DoctorRepository;
use App\Interfaces\PrescriptionRepositoryInterface;
use App\Repositories\PrescriptionRepository;
use App\Interfaces\MedicineRepositoryInterface;
use App\Repositories\MedicineRepository;
use App\Interfaces\NotificationRepositoryInterface;
use App\Repositories\NotificationRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register()
    {
        $bindings = [
            '\App\Interfaces\PatientRepositoryInterface' => '\App\Repositories\PatientRepository',
            '\App\Interfaces\DoctorRepositoryInterface' => '\App\Repositories\DoctorRepository',
            '\App\Interfaces\PrescriptionRepositoryInterface' => '\App\Repositories\PrescriptionRepository',
            '\App\Interfaces\MedicineRepositoryInterface' => '\App\Repositories\MedicineRepository',
            '\App\Interfaces\NotificationRepositoryInterface' => '\App\Repositories\NotificationRepository',
        ];

        foreach ($bindings as $interface => $implementation) {
            if (interface_exists($interface) && class_exists($implementation)) {
                $this->app->bind($interface, $implementation);
            }
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        //
    }
}
