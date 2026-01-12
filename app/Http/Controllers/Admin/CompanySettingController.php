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
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Models:
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Currency;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CompanySettingController extends Controller{
    /**
     * 1. Página de configuración de empresa.
     * 2. Actualizar datos de configuración.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'empresas';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'company-settings.create',
                'company-settings.destroy',
                'company-settings.edit',
                'company-settings.index',
                'company-settings.search',
                'company-settings.show',
                'company-settings.update'
            ]);   
        } 
    }  

    /**
     * 1. Página de configuración de empresa.
     */
    public function index(Request $request){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $company = Company::select('id', 'name', 'tradename')->find($currentCompanyId);

        $setting = CompanySetting::firstOrCreate(
            ['company_id' => $currentCompanyId],
            [] // defaults ya en migration
        );

        if (!$setting) {
            abort(404, __('empresa_no_encontrada'));
        }

        $this->authorize('view', $setting);

        //Formateo de datos:
        $setting->formatted_created_at = Carbon::parse($setting->created_at)->format($locale[4].' H:i:s');
        $setting->formatted_updated_at = Carbon::parse($setting->updated_at)->format($locale[4].' H:i:s');

        $currencies = Currency::select('id', 'name', 'symbol')
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        return Inertia::render('Admin/CompanySetting/Index', [
            "title" => __($this->option),
            "subtitle" => __('configuracion'),
            "module" => $this->module,
            "slug" => 'company-settings',
            "company" => $company,
            "setting" => $setting,
            "currencies" => $currencies,
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "languages" => LocaleTrait::languages(),
            "permissions" => $this->permissions,
        ]);
    }

    /**
     * 2. Actualizar datos de configuración.
     */
    public function update(Request $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $setting = CompanySetting::firstOrCreate(['company_id' => $currentCompanyId], []);

        $this->authorize('update', $setting);

        $allowedLanguages = array_keys($this->languages());

        $data = $request->validate([
            'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
            'language' => ['nullable', 'string', 'size:2', 'in:' . implode(',', $allowedLanguages)],

            'customers_management' => ['required', 'boolean'],
            'providers_management' => ['required', 'boolean'],
            'validate_nif' => ['required', 'boolean'],
            'require_2fa' => ['required', 'boolean'],

            'primary_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'secondary_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],

            'public_catalogue' => ['required', 'boolean'],
            'emails' => ['nullable', 'array'],
            'emails.*' => ['nullable', 'email', 'max:255'],
            'accounting_account_digits' => ['required', 'integer', 'min:1', 'max:30'],
            
            'pattern_budgets' => ['required', 'boolean'],
            'pattern_sales' => ['required', 'boolean'],
            'pattern_purchases' => ['required', 'boolean'],
            'pattern_deliveries' => ['required', 'boolean'],
            'pattern_projects' => ['required', 'boolean'],
            'pattern_invoices' => ['required', 'boolean'],
            'base_color_budgets' => ['nullable', 'string'],
            'base_color_orders' => ['nullable', 'string'],
            'base_color_invoices' => ['nullable', 'string'],
            'iva' => ['nullable', 'numeric'],
            'ip' => ['nullable', 'string', 'max:45'],
            'public_info' => ['nullable', 'array']
        ]);

        // ✅ normaliza emails: trim, quita vacíos, quita duplicados, reindexa
        $emails = collect($data['emails'] ?? [])
        ->map(fn ($e) => trim((string) $e))
        ->filter()                 // fuera vacíos
        ->unique()                 // fuera duplicados
        ->values()                 // reindex 0..n
        ->all();

        $data['emails'] = $emails ?: null;

        $setting->fill($data);

        // Esto fuerza el dirty correcto en JSON aunque haya rarezas de cast
        $setting->emails = $data['emails'];

        $setting->save();

        return redirect()->route('company-settings.index')
            ->with('msg', __('configuracion_actualizada'));
    }
}
