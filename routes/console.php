<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

//Crons:
//Producción:
//Schedule::command('auth:clear-resets')->hourly();        // borra tokens de reset caducados
//Schedule::command('session:prune')->hourly();            // si usas SESSION_DRIVER=database
//Schedule::command('user:expiration')->dailyAt('03:00');

//Tests:
Schedule::command('auth:clear-resets')->everyMinute();
Schedule::command('session:prune')->everyMinute();
Schedule::command('user:expiration')->everyMinute();