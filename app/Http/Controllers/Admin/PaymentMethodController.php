<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Models:
use App\Models\PaymentMethod;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\PaymentMethodFilterRequest;
use App\Http\Requests\PaymentMethodStoreRequest;
use App\Http\Requests\PaymentMethodUpdateRequest;

//Resources:
use App\Http\Resources\PaymentMethodResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class PaymentMethodController extends Controller{
    /**
     * 1. Listado de métodos de pago.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'accounting';
    private $option = 'pago_metodos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'payment-methods.create',
                'payment-methods.destroy',
                'payment-methods.edit',
                'payment-methods.index',
                'payment-methods.search',
                'payment-methods.show',
                'payment-methods.update'
            ]);   
        } 
    }   
}
