<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Jenssegers\Agent\Agent;

//Models:
use App\Models\UserPreference;

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
    public function index(CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if($companyId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }

        $favorites = \App\Models\UserPreference::forUser(Auth::id())
        ->forCompany($companyId)
        ->leftJoin('modules as m', 'm.slug', '=', 'user_preferences.module')
        ->orderBy('user_preferences.name') // alfabético
        ->get([
            'user_preferences.id',
            'user_preferences.name',
            'user_preferences.url',
            'user_preferences.module',
            'm.icon   as module_icon',
            'm.color  as module_color',
            'm.label  as module_label',
        ]);

        return Inertia::render('Admin/Dashboard/Index', [
            "title" => __('dashboard'),
            "subtitle" => '',
            "module" => $this->module,
            "slug" => '/',
            "permissions" => $this->permissions,
            "favorites" => $favorites
        ]);
    }
}
