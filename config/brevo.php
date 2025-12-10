<?php

return [
    'api_key'  => env('BREVO_API_KEY'),
    'base_url' => env('BREVO_BASE_URL', 'https://api.brevo.com/v3'),

    // Por si queremos tunear timeouts o logging más adelante
    'timeout'  => env('BREVO_TIMEOUT', 10), // segundos
];
