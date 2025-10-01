<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;
use Jenssegers\Agent\Agent;

class DashboardController extends Controller{
    /**
     * 1. Dashboard del Admin.
     */
    
    private $module = 'dashboard';
    private $option = 'dashboard';
    protected array $permissions = [];

    /**
     * 1. Dashboard del Admin.
     */
    public function index(){
        return Inertia::render('Admin/Dashboard/Index', [
            "title" => __('dashboard'),
            "subtitle" => '',
            "module" => $this->module,
            "slug" => '/',
            "permissions" => $this->permissions
        ]);
    }
}
