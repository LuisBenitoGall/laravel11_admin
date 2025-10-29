<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
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
        // return Inertia::render('Frontend/Home', [
        //     'APP_FULL_NAME' => env('APP_FULL_NAME'),
        //     'APP_NAME' => env('APP_NAME')
        // ]);

        //Para el proyecto RFT se omite la home y se hace redirección al Login.
        return redirect()->route('login');
    }
}
