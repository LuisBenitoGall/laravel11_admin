<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Alta de usuario: envía la contraseña temporal.
 * Misma vía mail que ResetPassword / LoginCode (config mail.from + MAIL_*).
 */
class SendUserPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $plainPassword,
        private readonly ?string $companyName = null,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $usuario = trim(($notifiable->name ?? '').' '.($notifiable->surname ?? ''));
        if ($usuario === '') {
            $usuario = (string) ($notifiable->email ?? '');
        }

        return (new MailMessage)
            ->subject(__('contrasena_envio'))
            ->view('emails.send-user-password', [
                'usuario' => $usuario,
                'email' => (string) ($notifiable->email ?? ''),
                'password' => $this->plainPassword,
                'loginUrl' => route('login'),
                'companyName' => $this->companyName ?: config('app.name'),
            ]);
    }
}
