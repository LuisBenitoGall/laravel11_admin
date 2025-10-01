<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller{
    /**
     * 1. Home.
     */

    /**
     * 1. Home.
     */
    public function index(){
        return Inertia::render('Frontend/Home', []);
    }
}
