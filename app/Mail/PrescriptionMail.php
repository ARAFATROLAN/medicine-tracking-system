<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PrescriptionMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
   # public function __construct()
    
        public $prescription;

public function __construct($prescription)
{
    $this->prescription = $prescription;
}

    }

    /**
     * Get the message envelope.
     */
    function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Prescription Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    function content(): Content
    {
        return new Content(
            view: 'prescription-mail',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    function attachments(): array
    {
        return [];
    }

