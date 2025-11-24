<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Models:
use App\Models\Company;

//Resources:
use App\Http\Resources\CrmOpportunityResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class CrmOpportunityController extends Controller
{
    /**
     * 
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'marketing';
    private $option = 'campanyas';
    protected array $permissions = [];

    /**
     * 1. Listado de campañas de marketing por empresa.
     */
    public function index(Request $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        //$opportunities = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);
        $opportunities = [];

        return Inertia::render('Admin/CrmOpportunity/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'crm-opportunities',
            "opportunities" => CrmOpportunityResource::collection($opportunities),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblCrmOpportunities'] 
            )
        ]);
    }
}
