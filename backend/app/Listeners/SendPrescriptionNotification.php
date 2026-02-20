<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PrescriptionMail;

class SendPrescriptionNotification
{
    /**
     * Create the event listener.
     */

/**
 * Handle the event.
 */
public function handle($event)
{
    Mail::to($event->prescription->doctor->email)
        ->queue(new PrescriptionMail($event->prescription));
}

}