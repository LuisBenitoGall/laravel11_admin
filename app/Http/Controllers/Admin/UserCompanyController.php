<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

//Models:
use App\Models\UserCompany;

class UserCompanyController extends Controller{
 	/**
 	 * 1. Desvincular a usuario de empresa.
 	 */
 	


 	/**
 	 * 1. Desvincular a usuario de empresa.
 	 */
 	public function destroy(UserCompany $uc){
 		try {
            $uc->delete();
            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting'], 500);
        }
 	}

}
