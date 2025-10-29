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
use App\Models\Attribute;
use App\Models\Product;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\AttributeFilterRequest;
use App\Http\Requests\AttributeStoreRequest;
use App\Http\Requests\AttributeUpdateRequest;

//Resources:
use App\Http\Resources\AttributeResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class AttributeController extends Controller{
    /**
     * 1. Listado de atributos.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'products';
    private $option = 'atributos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'attributes.create',
                'attributes.destroy',
                'attributes.edit',
                'attributes.index',
                'attributes.search',
                'attributes.show',
                'attributes.update'
            ]);   
        } 
    }   
}
