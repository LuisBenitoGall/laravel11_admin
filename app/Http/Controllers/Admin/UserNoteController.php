<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\UserNote;

//Requests:
use App\Http\Requests\NoteStoreRequest;

class UserNoteController extends Controller{
    /**
     * 1. Guardar nota.
     */
    
    /**
     * 1. Guardar nota.
     */
    public function store(NoteStoreRequest $request){

    }
}
