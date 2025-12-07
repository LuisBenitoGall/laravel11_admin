<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RecaptchaService
{
    public function verify(?string $token, ?string $expectedAction = null): ?float
    {
        if (empty($token)) {
            return null;
        }

        $secret = config('services.recaptcha.secret_key');

        $response = Http::asForm()->post(
            'https://www.google.com/recaptcha/api/siteverify',
            [
                'secret'   => $secret,
                'response' => $token,
            ]
        );

        if (! $response->ok()) {
            return null;
        }

        $data = $response->json();

        if (empty($data['success'])) {
            return null;
        }

        if ($expectedAction && (!isset($data['action']) || $data['action'] !== $expectedAction)) {
            return null;
        }

        return isset($data['score']) ? (float) $data['score'] : null;
    }
}
