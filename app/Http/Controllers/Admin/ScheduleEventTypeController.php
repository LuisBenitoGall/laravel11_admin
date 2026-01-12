<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ScheduleEventTypeController extends Controller
{
    private $module = 'schedule';
    private $option = 'agendas';
    protected array $permissions = [];
}
