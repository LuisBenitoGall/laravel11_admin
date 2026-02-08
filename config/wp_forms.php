<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Notificación de errores en formularios WP
    |--------------------------------------------------------------------------
    |
    | Email al que enviar notificación cuando falle el procesamiento de un
    | formulario WordPress (p. ej. newsletter-form). Si es null o vacío, solo
    | se registrará el error en el log.
    |
    */

    'error_notify_email' => env('WP_FORM_ERROR_NOTIFY_EMAIL', null),

];
