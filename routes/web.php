<?php

//Frontend:
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Frontend\HomeController;

//Admin:
// use App\Http\Controllers\Admin\AccountingController;
use App\Http\Controllers\Admin\AccountingAccountTypeController;
use App\Http\Controllers\Admin\AccountingAccountController;
use App\Http\Controllers\Admin\AccountingAccountUsageController;
use App\Http\Controllers\Admin\AccountingConceptController;
use App\Http\Controllers\Admin\AccountingOptionController;
use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AgencyController;
use App\Http\Controllers\Admin\AmortizationLineController;
use App\Http\Controllers\Admin\AmortizationController;
// use App\Http\Controllers\Admin\AnswerController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\BankAccountController;
use App\Http\Controllers\Admin\BankController;
use App\Http\Controllers\Admin\BatchController;
use App\Http\Controllers\Admin\BatchPatternController;
use App\Http\Controllers\Admin\BriefingController;
use App\Http\Controllers\Admin\BriefingItemController;
use App\Http\Controllers\Admin\BriefingTemplateController;
use App\Http\Controllers\Admin\BriefingTemplateItemController;
use App\Http\Controllers\Admin\BudgetController;
use App\Http\Controllers\Admin\BudgetFormController;
use App\Http\Controllers\Admin\BudgetFormItemController;
use App\Http\Controllers\Admin\BudgetPatternController;
use App\Http\Controllers\Admin\BudgetSettingController;
use App\Http\Controllers\Admin\BusinessAreaController;
// use App\Http\Controllers\Admin\CartController;
// use App\Http\Controllers\Admin\CashController;
// use App\Http\Controllers\Admin\CashConceptController;
// use App\Http\Controllers\Admin\CashPatternController;
use App\Http\Controllers\Admin\CategoryController;
// use App\Http\Controllers\Admin\ChatController;
// use App\Http\Controllers\Admin\ChatRoomController;
// use App\Http\Controllers\Admin\ChatRoomUserController;
use App\Http\Controllers\Admin\CompanyAccountController;
// use App\Http\Controllers\Admin\CompanyCalendarController;
use App\Http\Controllers\Admin\CompanyController;
// use App\Http\Controllers\Admin\CompanyGroupController;
use App\Http\Controllers\Admin\CompanyModuleController;
// use App\Http\Controllers\Admin\CompanyNotificationManagementController;
// use App\Http\Controllers\Admin\CompanySectorController;
use App\Http\Controllers\Admin\CompanySettingController;
// use App\Http\Controllers\Admin\CompanyUteController;
use App\Http\Controllers\Admin\ConcoursePatternController;
use App\Http\Controllers\Admin\ContentController;
// use App\Http\Controllers\Admin\ContentImageController;
use App\Http\Controllers\Admin\ContractController;
use App\Http\Controllers\Admin\CostCenterController;
use App\Http\Controllers\Admin\CountryController;
use App\Http\Controllers\Admin\CrmAccountController;
use App\Http\Controllers\Admin\CurrencyController;
// use App\Http\Controllers\Admin\CustomerProductController;
use App\Http\Controllers\Admin\CustomerProviderController;
use App\Http\Controllers\Admin\DashboardController;
// use App\Http\Controllers\Admin\DayTypeController;
// use App\Http\Controllers\Admin\DayTypeConfigController;
// use App\Http\Controllers\Admin\DayTypeUserConfigController;
// use App\Http\Controllers\Admin\DealerController;
use App\Http\Controllers\Admin\DeliveryController;
use App\Http\Controllers\Admin\DeliveryItemController;
// use App\Http\Controllers\Admin\DeliveryOrderController;
use App\Http\Controllers\Admin\DeliveryPatternController;
use App\Http\Controllers\Admin\EffectController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ExpenseController;
// use App\Http\Controllers\Admin\FileController;
use App\Http\Controllers\Admin\FunctionalityController;
use App\Http\Controllers\Admin\GroupController;
// use App\Http\Controllers\Admin\GroupMemberController;
// use App\Http\Controllers\Admin\HandbookController;
//use App\Http\Controllers\Admin\IncidenceController;
// use App\Http\Controllers\Admin\IncidenceDocController;
// use App\Http\Controllers\Admin\IncidenceMessageController;
use App\Http\Controllers\Admin\IncidencePatternController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\InvoicePatternController;
use App\Http\Controllers\Admin\InvoiceQueryController;
use App\Http\Controllers\Admin\InvoiceSettingController;
// use App\Http\Controllers\Admin\IpAccessController;
use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\Admin\IvaTypeController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\PlanningController;
use App\Http\Controllers\Admin\ProcedureController;
use App\Http\Controllers\Admin\ProcedurePatternController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductPatternController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ProjectPatternController;
use App\Http\Controllers\Admin\ProtocolController;
use App\Http\Controllers\Admin\ProvinceController;
use App\Http\Controllers\Admin\PurchaseProductController;
use App\Http\Controllers\Admin\ReceivingController;
use App\Http\Controllers\Admin\RemittanceController;
use App\Http\Controllers\Admin\RemittancePatternController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SatController;
use App\Http\Controllers\Admin\SatPatternController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\ScheduleEventTypeController;
use App\Http\Controllers\Admin\SeatController;
use App\Http\Controllers\Admin\SecondaryMenuController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Admin\ShipmentPatternController;
use App\Http\Controllers\Admin\StaffPickController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Admin\StockMovementController;
use App\Http\Controllers\Admin\StoreController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\TownController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\UserColumnPreferenceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\WorkOrderController;
use App\Http\Controllers\Admin\WorkOrderPatternController;
use App\Http\Controllers\Admin\WorkplaceController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//Cambio idioma:
Route::get('/language/{language}', function ($language) {
    Session()->put('locale', $language);
    return redirect()->back();
})->name('language');

//IMPORTS JSON:
// Route::get('/secondary-menu', function () {
//     $path = storage_path('json/secondary-menu.json');

//     if (!File::exists($path)) {
//         return response()->json(['error' => 'File not found'], 404);
//     }

//     $json = File::get($path);
//     return Response::json(json_decode($json, true));
// });
Route::get('/secondary-menu', [SecondaryMenuController::class, '__invoke'])->middleware(['auth']);

Route::get('/csrf-cookie', function () {
    return response()->json([], 204);
});

//FRONTEND:
Route::get('/', [HomeController::class, 'index'])->name('home');

//Route::get('/', function () {


    // return Inertia::render('Welcome', [
    //     'canLogin' => Route::has('login'),
    //     'canRegister' => Route::has('register'),
    //     'laravelVersion' => Application::VERSION,
    //     'phpVersion' => PHP_VERSION,
    // ]);
//});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


//ADMIN:
Route::middleware(['web', 'auth', 'company'])->prefix('admin')->group(function(){
    //Accounting Account Types:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/accounting-account-types', [AccountingAccountTypeController::class, 'index'])->name('accounting-account-types.index')->middleware('permission:accounting-account-types.index');
        Route::get('/accounting-account-types/filtered-data', [AccountingAccountTypeController::class, 'filteredData'])->name('accounting-account-types.filtered-data')->middleware('permission:accounting-account-types.index');
        Route::get('/accounting-account-types/create', [AccountingAccountTypeController::class, 'create'])->name('accounting-account-types.create')->middleware('permission:accounting-account-types.create');
        Route::post('/accounting-account-types/store', [AccountingAccountTypeController::class, 'store'])->name('accounting-account-types.store')->middleware('permission:accounting-account-types.create');
        Route::get('/accounting-account-types/{type}/edit', [AccountingAccountTypeController::class, 'edit'])->name('accounting-account-types.edit')->middleware('permission:accounting-account-types.edit');
        Route::put('/accounting-account-types/{type}', [AccountingAccountTypeController::class, 'update'])->name('accounting-account-types.update')->middleware('permission:accounting-account-types.update');
        Route::delete('/accounting-account-types/{type}', [AccountingAccountTypeController::class, 'destroy'])->name('accounting-account-types.destroy')->middleware('permission:accounting-account-types.destroy');
        Route::get('accounting-account-types/{type}/select', [AccountingAccountTypeController::class, 'select'])->name('accounting-account-types.select');
    });

    //Accounting Accounts:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/accounting-accounts', [AccountingAccountController::class, 'index'])->name('accounting-accounts.index')->middleware('permission:accounting-accounts.index');
        Route::get('/accounting-accounts/create', [AccountingAccountController::class, 'create'])->name('accounting-accounts.create')->middleware('permission:accounting-accounts.create');
        Route::post('/accounting-accounts/store', [AccountingAccountController::class, 'store'])->name('accounting-accounts.store')->middleware('permission:accounting-accounts.create');
        Route::get('/accounting-accounts/{account}/edit', [AccountingAccountController::class, 'edit'])->name('accounting-accounts.edit')->middleware('permission:accounting-accounts.edit');
        Route::put('/accounting-accounts/{account}', [AccountingAccountController::class, 'update'])->name('accounting-accounts.update')->middleware('permission:accounting-accounts.update');
        Route::delete('/accounting-accounts/{account}', [AccountingAccountController::class, 'destroy'])->name('accounting-accounts.destroy')->middleware('permission:accounting-accounts.destroy');
        Route::post('/accounting-accounts/status', [AccountingAccountController::class, 'status'])->name('accounting-accounts.status')->middleware('permission:accounting-accounts.edit');
        Route::get('/accounting-accounts/parent-options', [AccountingAccountController::class, 'parentOptions'])->name('accounting-accounts.parent-options');
        Route::get('accounting-accounts/iva-accounts', [AccountingAccountController::class, 'ivaAccounts'])->name('accounting-accounts.iva-accounts')->middleware('permission:accounting-accounts.index');
        Route::post('/accounting-accounts/store-auto-account', [AccountingAccountController::class, 'storeAutoAccount'])->name('accounting-accounts.store-auto-account')->middleware('permission:accounting-accounts.create');
        Route::post('accounting-accounts/iva-bulk-generate', [AccountingAccountController::class, 'bulkGenerateIva'])->name('accounting-accounts.iva-bulk-generate')->middleware('permission:accounting-accounts.create');
    });

    //Accounting Account Usages:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::delete('accounting-accounts-usages/{usage}', [AccountingAccountUsageController::class, 'unlinkUsage'])->name('accounting-accounts-usages.destroy');
    });

    //Accounting Concepts:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/accounting-concepts', [AccountingConceptController::class, 'index'])->name('accounting-concepts.index')->middleware('permission:accounting-concepts.index');
    });

    //Accounting Options:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/accounting-options', [AccountingOptionController::class, 'index'])->name('accounting-options.index')->middleware('permission:accounting-options.index');
    });

    //Accounts:
    Route::middleware('module_setted:account')->group(function (){
        Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index')->middleware('permission:accounts.index');
        Route::get('/accounts/filtered-data', [AccountController::class, 'filteredData'])->name('accounts.filtered-data')->middleware('permission:accounts.index');
        Route::get('/accounts/create', [AccountController::class, 'create'])->name('accounts.create')->middleware('permission:accounts.create');
        Route::post('/accounts/store', [AccountController::class, 'store'])->name('accounts.store')->middleware('permission:accounts.create');
        Route::get('/accounts/{account}/edit', [AccountController::class, 'edit'])->name('accounts.edit')->middleware('permission:accounts.edit');
        Route::put('/accounts/{account}', [AccountController::class, 'update'])->name('accounts.update')->middleware('permission:accounts.update');
        Route::delete('/accounts/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy')->middleware('permission:accounts.destroy');
        Route::post('/accounts/status', [AccountController::class, 'status'])->name('accounts.status')->middleware('permission:accounts.edit');
    });

    //Agencies:
    Route::get('/agencies', [AgencyController::class, 'index'])->name('agencies.index')->middleware('permission:agencies.index');

    //Admin Dashboard:
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index')->middleware('permission:dashboard.index');

    //Amortizations:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/amortizations', [AmortizationController::class, 'index'])->name('amortizations.index')->middleware('permission:amortizations.index');
    });

    //Attributes:
    Route::get('/attributes', [AttributeController::class, 'index'])->name('attributes.index')->middleware('permission:attributes.index');

    //Bank Accounts:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/bank-accounts', [BankAccountController::class, 'index'])->name('bank-accounts.index')->middleware('permission:bank-accounts.index');
        Route::get('/bank-accounts/filtered-data', [BankAccountController::class, 'filteredData'])->name('bank-accounts.filtered-data')->middleware('permission:bank-accounts.index');
        Route::get('/bank-accounts/create', [BankAccountController::class, 'create'])->name('bank-accounts.create')->middleware('permission:bank-accounts.create');
        Route::post('/bank-accounts/store', [BankAccountController::class, 'store'])->name('bank-accounts.store')->middleware('permission:bank-accounts.create');
        Route::get('/bank-accounts/{account}/edit', [BankAccountController::class, 'edit'])->name('bank-accounts.edit')->middleware('permission:bank-accounts.edit');
        Route::put('/bank-accounts/{account}', [BankAccountController::class, 'update'])->name('bank-accounts.update')->middleware('permission:bank-accounts.update');
        Route::post('/bank-accounts/status', [BankAccountController::class, 'status'])->name('bank-accounts.status')->middleware('permission:bank-accounts.edit');
        Route::delete('/bank-accounts/{account}', [BankAccountController::class, 'destroy'])->name('bank-accounts.destroy')->middleware('permission:bank-accounts.destroy');
    });

    //Banks:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/banks', [BankController::class, 'index'])->name('banks.index')->middleware('permission:banks.index');
        Route::get('/banks/filtered-data', [BankController::class, 'filteredData'])->name('banks.filtered-data')->middleware('permission:banks.index');
        Route::get('/banks/create', [BankController::class, 'create'])->name('banks.create')->middleware('permission:banks.create');
        Route::post('/banks/store', [BankController::class, 'store'])->name('banks.store')->middleware('permission:banks.create');
        Route::get('/banks/{bank}/edit', [BankController::class, 'edit'])->name('banks.edit')->middleware('permission:banks.edit');
        Route::put('/banks/{bank}', [BankController::class, 'update'])->name('banks.update')->middleware('permission:banks.update');
        Route::post('/banks/status', [BankController::class, 'status'])->name('banks.status')->middleware('permission:banks.edit');
        Route::delete('/banks/{bank}', [BankController::class, 'destroy'])->name('banks.destroy')->middleware('permission:banks.destroy');
    });

    //Batch Patterns:
    Route::get('/batch-patterns', [BatchPatternController::class, 'index'])->name('batch-patterns.index')->middleware('permission:batch-patterns.index');

    //Briefings:
    Route::get('/briefings', [BriefingController::class, 'index'])->name('briefings.index')->middleware('permission:briefings.index');

    //Briefings Items:
    Route::get('/briefing-items', [BriefingItemController::class, 'index'])->name('briefing-items.index')->middleware('permission:briefing-items.index');

    //Briefings Templates:
    Route::get('/briefing-templates', [BriefingTemplateController::class, 'index'])->name('briefing-templates.index')->middleware('permission:briefing-templates.index');

    //Briefings Templates Items:
    Route::get('/briefing-templates-items', [BriefingTemplateItemController::class, 'index'])->name('briefing-templates-items.index')->middleware('permission:briefing-templates-items.index');

    //Budget Forms:
    Route::get('/budget-forms', [BudgetFormController::class, 'index'])->name('budget-forms.index')->middleware('permission:budget-forms.index');

    //Budget Patterns:
    Route::get('/budget-patterns', [BudgetPatternController::class, 'index'])->name('budget-patterns.index')->middleware('permission:budget-patterns.index');

    //Budget Settings:
    Route::get('/budget-settings', [BudgetSettingController::class, 'index'])->name('budget-settings.index')->middleware('permission:budget-settings.index');

    //Budgets:
    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index')->middleware('permission:budgets.index');

    //Budgets From Providers:
    Route::get('/budgets-from-providers', [BudgetController::class, 'index'])->name('budgets-from-providers.index')->middleware('permission:budgets-from-providers.index');

    //Business Areas:
    Route::middleware('module_setted:companies')->group(function (){
        Route::get('/business-areas', [BusinessAreaController::class, 'index'])->name('business-areas.index')->middleware('permission:business-areas.index');
        Route::get('/business-areas/filtered-data', [BusinessAreaController::class, 'filteredData'])->name('business-areas.filtered-data')->middleware('permission:business-areas.index');
        Route::get('/business-areas/create', [BusinessAreaController::class, 'create'])->name('business-areas.create')->middleware('permission:business-areas.create');
        Route::post('/business-areas/store', [BusinessAreaController::class, 'store'])->name('business-areas.store')->middleware('permission:business-areas.create');
        Route::get('/business-areas/{business_area}/edit', [BusinessAreaController::class, 'edit'])->name('business-areas.edit')->middleware('permission:business-areas.edit');
        Route::put('/business-areas/{business_area}/update', [BusinessAreaController::class, 'update'])->name('business-areas.update')->middleware('permission:business-areas.update');
        Route::delete('/business-areas/{business_area}', [BusinessAreaController::class, 'destroy'])->name('business-areas.destroy')->middleware('permission:business-areas.destroy');
        Route::post('business-areas/status', [BusinessAreaController::class, 'status'])->name('business-areas.status')->middleware('permission:business-areas.status');
    });

    //Company: no puede llevar middleware module_setted pues antes de seleccionar empresa no están definidos los módulos vinculados.
    //Route::middleware('module_setted:companies')->group(function (){
        Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index')->middleware('permission:companies.index');
        Route::get('/companies/filtered-data', [CompanyController::class, 'filteredData'])->name('companies.filtered-data')->middleware('permission:companies.index');
        Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create')->middleware('permission:companies.create');
        Route::post('/companies/store', [CompanyController::class, 'store'])->name('companies.store')->middleware('permission:companies.store');
        Route::get('/companies/{company}/edit', [CompanyController::class, 'edit'])->name('companies.edit')->middleware('permission:companies.edit');
        Route::put('/companies/{company}', [CompanyController::class, 'update'])->name('companies.update')->middleware('permission:companies.update');
        Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy')->middleware('permission:companies.destroy');
        Route::delete('/companies/{company}/logo', [CompanyController::class, 'deleteLogo'])->name('companies.logo.delete')->middleware('permission:companies.edit');
        Route::post('/companies/status', [CompanyController::class, 'status'])->name('companies.status')->middleware('permission:companies.edit');
        Route::get('/companies/{company}/select', [CompanyController::class, 'selectCompany'])->name('companies.select-get')->middleware('permission:companies.index');
        Route::post('/companies/select', [CompanyController::class, 'selectCompanyPost'])->name('companies.select')->withoutMiddleware(VerifyCsrfToken::class)->middleware('permission:companies.index');
        Route::get('/companies/refresh-session', [CompanyController::class, 'refreshSession'])->name('companies.refresh-session')->middleware('permission:companies.index');
    //});

    //Company Accounts:
    Route::get('/company-accounts', [CompanyAccountController::class, 'index'])->name('company-accounts.index')->middleware('permission:company-accounts.index');
    Route::get('/company-accounts/filtered-data', [CompanyAccountController::class, 'filteredData'])->name('company-accounts.filtered-data')->middleware('permission:company-accounts.index');
    Route::get('/company-accounts/create', [CompanyAccountController::class, 'create'])->name('company-accounts.create')->middleware('permission:company-accounts.create');
    Route::delete('company-accounts/{account}', [CompanyAccountController::class, 'destroy'])->name('company-accounts.destroy')->middleware('permission:company-accounts.destroy');

    //Company Modules:
    Route::get('/company-modules', [CompanyModuleController::class, 'index'])->name('company-modules.index')->middleware('permission:company-modules.index');
    Route::post('/company-modules/toggle/{module_id}', [CompanyModuleController::class, 'toggle'])->name('company-modules.toggle');

    //Company Settings:
    Route::get('/company-settings', [CompanySettingController::class, 'index'])->name('company-settings.index')->middleware('permission:company-settings.index');

    //Concourse Patterns:
    Route::get('/concourse-patterns', [ConcoursePatternController::class, 'index'])->name('concourse-patterns.index')->middleware('permission:concourse-patterns.index');

    //Contents:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/contents', [ContentController::class, 'index'])->name('contents.index')->middleware('permission:contents.index');
        Route::get('/contents/create', [ContentController::class, 'create'])->name('contents.create')->middleware('permission:contents.create');
        Route::post('/contents/store', [ContentController::class, 'store'])->name('contents.store')->middleware('permission:contents.create');
        Route::get('/contents/{content}/edit', [ContentController::class, 'edit'])->name('contents.edit')->middleware('permission:contents.edit');
        Route::put('/contents/{content}/update', [ContentController::class, 'update'])->name('contents.update')->middleware('permission:contents.update');
        Route::delete('/contents/{content}', [ContentController::class, 'destroy'])->name('contents.destroy')->middleware('permission:contents.destroy');
        Route::post('/contents/status', [ContentController::class, 'status'])->name('contents.status')->middleware('permission:contents.edit');
    });

    //Contracts:
    Route::get('/contracts', [ContractController::class, 'index'])->name('contracts.index')->middleware('permission:contracts.index');

    //Control Panel:
    //Route::get('/control-panel', [ControlPanelController::class, 'index'])->name('control-panel.index')->middleware('permission:control-panel.index');

    //Cost Centers:
    Route::middleware('module_setted:companies')->group(function (){
        Route::get('/cost-centers', [CostCenterController::class, 'index'])->name('cost-centers.index')->middleware('permission:cost-centers.index');
        Route::get('/cost-centers/filtered-data', [CostCenterController::class, 'filteredData'])->name('cost-centers.filtered-data')->middleware('permission:cost-centers.index');
        Route::get('/cost-centers/create', [CostCenterController::class, 'create'])->name('cost-centers.create')->middleware('permission:cost-centers.create');
        Route::post('/cost-centers/store', [CostCenterController::class, 'store'])->name('cost-centers.store')->middleware('permission:cost-centers.create');
        Route::get('/cost-centers/{cost_center}/edit', [CostCenterController::class, 'edit'])->name('cost-centers.edit')->middleware('permission:cost-centers.edit');
        Route::put('/cost-centers/{cost_center}/update', [CostCenterController::class, 'update'])->name('cost-centers.update')->middleware('permission:cost-centers.update');
        Route::delete('/cost-centers/{cost_center}', [CostCenterController::class, 'destroy'])->name('cost-centers.destroy')->middleware('permission:cost-centers.destroy');
        Route::post('cost-centers/status', [CostCenterController::class, 'status'])->name('cost-centers.status')->middleware('permission:cost-centers.edit');
    });

    //Countries:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/countries', [CountryController::class, 'index'])->name('countries.index')->middleware('permission:countries.index');
        Route::get('/countries/filtered-data', [CountryController::class, 'filteredData'])->name('countries.filtered-data')->middleware('permission:countries.index');
        Route::get('/countries/create', [CountryController::class, 'create'])->name('countries.create')->middleware('permission:countries.create');
        Route::post('/countries', [CountryController::class, 'store'])->name('countries.store')->middleware('permission:countries.create');
        Route::get('/countries/{country}/edit', [CountryController::class, 'edit'])->name('countries.edit')->middleware('permission:countries.edit');
        Route::put('/countries/{country}', [CountryController::class, 'update'])->name('countries.update')->middleware('permission:countries.update');
        Route::delete('/countries/{country}', [CountryController::class, 'destroy'])->name('countries.delete')->middleware('permission:countries.delete');
        Route::post('/countries/status', [CountryController::class, 'status'])->name('countries.status')->middleware('permission:countries.edit');
    });

    //CRM Accounts:
    Route::middleware('module_setted:crm')->group(function (){
        Route::get('/crm-accounts', [CrmAccountController::class, 'index'])->name('crm-accounts.index')->middleware('permission:crm-accounts.index');
        Route::get('/crm-accounts/search', [CrmAccountController::class, 'search'])->name('search')->middleware('permission:crm-accounts.search');
        Route::get('/crm-accounts/create', [CrmAccountController::class, 'create'])->name('crm-accounts.create')->middleware('permission:crm-accounts.create');
        Route::post('/crm-accounts', [CrmAccountController::class, 'store'])->name('crm-accounts.store')->middleware('permission:crm-accounts.create');
        Route::get('crm-accounts/{account}', [CrmAccountController::class, 'show'])->name('crm-accounts.show')->middleware('permission:crm-accounts.show');
        Route::get('crm-accounts/{account}/edit', [CrmAccountController::class, 'edit'])->name('crm-accounts.edit')->middleware('permission:crm-accounts.edit');
        Route::put('crm-accounts/{account}', [CrmAccountController::class, 'update'])->name('crm-accounts.update')->middleware('permission:crm-accounts.update|crm-accounts.update.own');
        Route::delete('crm-accounts/{account}', [CrmAccountController::class, 'destroy'])->name('crm-accounts.destroy')->middleware('permission:crm-accounts.destroy|crm-accounts.destroy.own');
    });

    //Currencies:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/currencies', [CurrencyController::class, 'index'])->name('currencies.index')->middleware('permission:currencies.index');
        Route::get('/currencies/filtered-data', [CurrencyController::class, 'filteredData'])->name('currencies.filtered-data')->middleware('permission:currencies.index');
        Route::get('/currencies/create', [CurrencyController::class, 'create'])->name('currencies.create')->middleware('permission:currencies.create');
        Route::post('/currencies', [CurrencyController::class, 'store'])->name('currencies.store')->middleware('permission:currencies.create');
        Route::get('/currencies/{currency}/edit', [CurrencyController::class, 'edit'])->name('currencies.edit')->middleware('permission:currencies.edit');
        Route::put('/currencies/{currency}/update', [CurrencyController::class, 'update'])->name('currencies.update')->middleware('permission:currencies.update');
        Route::delete('/currencies/{currency}', [CurrencyController::class, 'destroy'])->name('currencies.destroy')->middleware('permission:currencies.destroy');
        Route::post('/currencies/status', [CurrencyController::class, 'status'])->name('currencies.status')->middleware('permission:currencies.status');
    });

    //Customers:
    Route::get('/customers', [CustomerProviderController::class, 'customers'])->name('customers.index')->middleware('permission:customers.index');
    Route::get('customers/create', [CustomerProviderController::class, 'create'])->name('customers.create')->defaults('side', 'customers')->middleware('permission:customers.create');
    Route::get('customers/import', [CustomerProviderController::class, 'import'])->name('customers.import')->defaults('side', 'customers')->middleware('permission:customers.create');
    Route::post('customers', [CustomerProviderController::class, 'store'])->name('customers.store')->middleware('permission:customers.create');
    //Este método sirve tanto para clientes como proveedores:
    Route::post('/customer-provider/store-by-list', [CustomerProviderController::class, 'storeByList'])->name('customer-provider.store-by-list');
    Route::get('customers/{cp}', [CustomerProviderController::class, 'show'])->name('customers.show')->middleware('permission:customers.show');
    Route::get('customers/{cp}/edit', [CustomerProviderController::class, 'edit'])->name('customers.edit')->middleware('permission:customers.edit');
    Route::put('customers/{cp}', [CustomerProviderController::class, 'update'])->name('customers.update')->middleware('permission:customers.update');
    Route::delete('customers/{cp}', [CustomerProviderController::class, 'destroy'])->name('customers.destroy')->middleware('permission:customers.destroy');
    
    //Deliveries:
    Route::get('/deliveries', [DeliveryController::class, 'index'])->name('deliveries.index')->middleware('permission:deliveries.index');

    //Delivery Patterns:
    Route::get('/delivery-patterns', [DeliveryPatternController::class, 'index'])->name('delivery-patterns.index')->middleware('permission:delivery-patterns.index');

    //Effects:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/effects', [EffectController::class, 'index'])->name('effects.index')->middleware('permission:effects.index');
    });

    //Employees:
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index')->middleware('permission:employees.index');

    //Errors:
    Route::get('/forbidden', function () {
        return inertia('Errors/Forbidden', [
            'alert' => session('alert'),
        ]);
    })->name('error.403');

    //Expenses:
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index')->middleware('permission:expenses.index');

    //Functionalities:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/functionalities', [FunctionalityController::class, 'index'])->name('functionalities.index')->middleware('permission:functionalities.index');
        Route::get('/functionalities/filtered-data', [FunctionalityController::class, 'filteredData'])->name('functionalities.filtered-data')->middleware('permission:functionalities.index');
        Route::post('/functionalities/store', [FunctionalityController::class, 'store'])->name('functionalities.store')->middleware('permission:functionalities.create');
        Route::get('/functionalities/{functionality}/edit', [FunctionalityController::class, 'edit'])->name('functionalities.edit')->middleware('permission:functionalities.edit');
        Route::put('/functionalities/{functionality}/update', [FunctionalityController::class, 'update'])->name('functionalities.update')->middleware('permission:functionalities.update');
        Route::delete('/functionalities/{functionality}', [FunctionalityController::class, 'destroy'])->name('functionalities.destroy')->middleware('permission:functionalities.destroy');
    });

    //Groups:
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index')->middleware('permission:groups.index');

    //Incidence Patterns:
    Route::get('/incidence-patterns', [IncidencePatternController::class, 'index'])->name('incidence-patterns.index')->middleware('permission:incidence-patterns.index');

    //Inventory:
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index')->middleware('permission:inventory.index');

    //Invoice Patterns:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/invoice-patterns', [InvoicePatternController::class, 'index'])->name('invoice-patterns.index')->middleware('permission:invoice-patterns.index');
    });

    //Invoice Queries:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/invoice-queries', [InvoiceQueryController::class, 'index'])->name('invoice-queries.index')->middleware('permission:invoice-queries.index');
    });

    //Invoice Settings:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/invoice-settings', [InvoiceSettingController::class, 'index'])->name('invoice-settings.index')->middleware('permission:invoice-settings.index');
    });

    //Invoices:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index')->middleware('permission:invoices.index');
    });

    //Iva Types:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/iva-types', [IvaTypeController::class, 'index'])->name('iva-types.index')->middleware('permission:iva-types.index');
        Route::get('/iva-types/filtered-data', [IvaTypeController::class, 'filteredData'])->name('iva-types.filtered-data')->middleware('permission:iva-types.index');
        Route::get('/iva-types/create', [IvaTypeController::class, 'create'])->name('iva-types.create')->middleware('permission:iva-types.create');
        Route::post('/iva-types/store', [IvaTypeController::class, 'store'])->name('iva-types.store')->middleware('permission:iva-types.create');
        Route::get('/iva-types/{type}/edit', [IvaTypeController::class, 'edit'])->name('iva-types.edit')->middleware('permission:iva-types.edit');
        Route::put('/iva-types/{type}/update', [IvaTypeController::class, 'update'])->name('iva-types.update')->middleware('permission:iva-types.update');
        Route::delete('/iva-types/{type}', [IvaTypeController::class, 'destroy'])->name('iva-types.destroy')->middleware('permission:iva-types.destroy');
        Route::post('iva-types/status', [IvaTypeController::class, 'status'])->name('iva-types.status')->middleware('permission:iva-types.edit');
    });

    //Leads:
    Route::get('/leads', [CrmAccountController::class, 'index'])->name('leads.index')->middleware('permission:leads');

    //Modules:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/modules', [ModuleController::class, 'index'])->name('modules.index')->middleware('permission:modules.index');
        Route::get('/modules/filtered-data', [ModuleController::class, 'filteredData'])->name('modules.filtered-data')->middleware('permission:modules.index');
        Route::get('/modules/create', [ModuleController::class, 'create'])->name('modules.create')->middleware('permission:modules.create');
        Route::post('/modules/store', [ModuleController::class, 'store'])->name('modules.store')->middleware('permission:modules.create');
        Route::get('/modules/{module}/edit/{tab?}', [ModuleController::class, 'edit'])->name('modules.edit')->middleware('permission:modules.edit');
        Route::put('/modules/{module}/update', [ModuleController::class, 'update'])->name('modules.update')->middleware('permission:modules.update');
        Route::delete('/modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy')->middleware('permission:modules.destroy');
        Route::post('modules/status', [ModuleController::class, 'status'])->name('modules.status')->middleware('permission:modules.edit');
    });

    //Order Categories:
    //Route::get('/order-categories', [OrderCategoriesController::class, 'index'])->name('order-categories.index')->middleware('permission:order-categories.index');

    //Order Groups:
    //Route::get('/order-groups', [OrderGroupController::class, 'index'])->name('order-groups.index')->middleware('permission:order-groups.index');

    //Order Patterns:
    Route::get('/order-patterns', [OrderPatternController::class, 'index'])->name('order-patterns.index')->middleware('permission:order-patterns.index');

    //Order Queries:
    Route::get('/order-queries', [OrderQueryController::class, 'index'])->name('order-queries.index')->middleware('permission:order-queries.index');

    //Order Settings:
    Route::get('/order-settings', [OrderSettingController::class, 'index'])->name('order-settings.index')->middleware('permission:order-settings.index');

    //Orders:
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index')->middleware('permission:orders.index');

    //Payment Methods:
    Route::get('/payment-methods', [PaymentMethodController::class, 'index'])->name('payment-methods.index')->middleware('permission:payment-methods.index');

    //Permissions:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index')->middleware('permission:permissions.index');
        Route::get('/permissions/filtered-data', [PermissionController::class, 'filteredData'])->name('permissions.filtered-data')->middleware('permission:permissions.index');
        Route::get('/permissions/create', [PermissionController::class, 'create'])->name('permissions.create')->middleware('permission:permissions.create');
        Route::post('/permissions/store', [PermissionController::class, 'store'])->name('permissions.store')->middleware('permission:permissions.create');
        Route::get('/permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit')->middleware('permission:permissions.edit');
        Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy')->middleware('permission:permissions.destroy');
    });

    //Planning:
    Route::get('/planning', [PlanningController::class, 'index'])->name('planning.index')->middleware('permission:planning.index');

    //Procedure Patterns:
    Route::get('/procedure-patterns', [ProcedurePatternController::class, 'index'])->name('procedure-patterns.index')->middleware('permission:procedure-patterns.index');

    //Procedures:
    Route::get('/procedures', [ProcedureController::class, 'index'])->name('procedures.index')->middleware('permission:procedures.index');

    //Product Categories:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/product-categories', [CategoryController::class, 'index'])->name('product-categories.index')->middleware('permission:product-categories.index');
    });

    //Product Patterns:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/product-patterns', [ProductPatternController::class, 'index'])->name('product-patterns.index')->middleware('permission:product-patterns.index');
        Route::get('/product-patterns/filtered-data', [ProductPatternController::class, 'filteredData'])->name('product-patterns.filtered-data')->middleware('permission:product-patterns.index');
        Route::get('/product-patterns/create', [ProductPatternController::class, 'create'])->name('product-patterns.create')->middleware('permission:product-patterns.create');
        Route::post('/product-patterns/store', [ProductPatternController::class, 'store'])->name('product-patterns.store')->middleware('permission:product-patterns.create');
        Route::get('/product-patterns/{pattern}/edit', [ProductPatternController::class, 'edit'])->name('product-patterns.edit')->middleware('permission:product-patterns.edit');
        Route::put('/product-patterns/{pattern}', [ProductPatternController::class, 'update'])->name('product-patterns.update')->middleware('permission:product-patterns.update');
        Route::delete('/product-patterns/{pattern}', [ProductPatternController::class, 'destroy'])->name('product-patterns.destroy')->middleware('permission:product-patterns.destroy');
        Route::post('/product-patterns/status', [ProductPatternController::class, 'status'])->name('product-patterns.status')->middleware('permission:product-patterns.edit');
    });

    //Products:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/products', [ProductController::class, 'index'])->name('products.index')->middleware('permission:products.index');
        Route::get('/products/filtered-data', [ProductController::class, 'filteredData'])->name('products.filtered-data')->middleware('permission:products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create')->middleware('permission:products.create');
        Route::post('/products/store', [ProductController::class, 'store'])->name('products.store')->middleware('permission:products.create');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->middleware('permission:products.edit');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('permission:products.destroy');
        Route::post('/products/status', [ProductController::class, 'status'])->name('products.status')->middleware('permission:products.edit');
    });

    //Project Categories:
    Route::get('/project-categories', [CategoryController::class, 'index'])->name('project-categories.index')->middleware('permission:project-categories.index');

    //Project Patterns:
    Route::get('/project-patterns', [ProjectPatternController::class, 'index'])->name('project-patterns.index')->middleware('permission:project-patterns.index');

    //Projects:
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index')->middleware('permission:projects.index');

    //Protocols:
    Route::get('/protocols', [ProtocolController::class, 'index'])->name('protocols.index')->middleware('permission:protocols.index');

    //Providers:
    Route::middleware('module_setted:companies')->group(function (){
        Route::get('/providers', [CustomerProviderController::class, 'providers'])->name('providers.index')->middleware('permission:providers.index');
        Route::get('providers/create', [CustomerProviderController::class, 'create'])->name('providers.create')->defaults('side', 'providers')->middleware('permission:providers.create');
        Route::post('providers', [CustomerProviderController::class, 'store'])->name('providers.store')->middleware('permission:providers.create');
        Route::get('providers/{cp}', [CustomerProviderController::class, 'show'])->name('providers.show')->middleware('permission:providers.show');
        Route::get('providers/{cp}/edit', [CustomerProviderController::class, 'edit'])->name('providers.edit')->middleware('permission:providers.edit');
        Route::put('providers/{cp}', [CustomerProviderController::class, 'update'])->name('providers.update')->middleware('permission:providers.update');
        Route::delete('providers/{cp}', [CustomerProviderController::class, 'destroy'])->name('providers.destroy')->middleware('permission:providers.destroy');
    });

    //Provinces:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/provinces/{country}', [ProvinceController::class, 'index'])->name('provinces.index')->middleware('permission:provinces.index');
        Route::get('/provinces/filtered-data/{country}', [ProvinceController::class, 'filteredData'])->name('provinces.filtered-data')->middleware('permission:provinces.index');
        Route::get('/provinces/{country}/create', [ProvinceController::class, 'create'])->name('provinces.create')->middleware('permission:provinces.create');
        Route::post('/provinces', [ProvinceController::class, 'store'])->name('provinces.store')->middleware('permission:provinces.create');
        Route::get('/provinces/{province}/edit', [ProvinceController::class, 'edit'])->name('provinces.edit')->middleware('permission:provinces.edit');
        Route::put('/provinces/{province}', [ProvinceController::class, 'update'])->name('provinces.update')->middleware('permission:provinces.update');
        Route::delete('/provinces/{province}', [ProvinceController::class, 'destroy'])->name('provinces.destroy')->middleware('permission:provinces.destroy');
        Route::post('/provinces/status', [ProvinceController::class, 'status'])->name('provinces.status')->middleware('permission:provinces.edit');
    });

    //Purchase Patterns:
    Route::get('/purchase-patterns', [PurchasePatternController::class, 'index'])->name('purchase-patterns.index')->middleware('permission:purchase-patterns.index');

    //Purchase Products:
    Route::get('/purchase-products', [PurchaseProductController::class, 'index'])->name('purchase-products.index')->middleware('permission:purchase-products.index');

    //Receivings:
    Route::get('/receiving', [ReceivingController::class, 'index'])->name('receiving.index')->middleware('permission:receiving.index');

    //Remittance Patterns:
    Route::get('/remittance-patterns', [RemittancePatternController::class, 'index'])->name('remittance-patterns.index')->middleware('permission:remittance-patterns.index');

    //Remittances:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/remittances', [RemittanceController::class, 'index'])->name('remittances.index')->middleware('permission:remittances.index');
    });

    //Roles:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index')->middleware('permission:roles.index');
        Route::get('/roles/filtered-data', [RoleController::class, 'filteredData'])->name('roles.filtered-data')->middleware('permission:roles.index');
        Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create')->middleware('permission:roles.create');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store')->middleware('permission:roles.create');
        Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit')->middleware('permission:roles.edit');
        Route::put('/roles/{role}/update', [RoleController::class, 'update'])->name('roles.update')->middleware('permission:roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:roles.destroy');
        Route::post('/roles/{role}/set-permission', [RoleController::class, 'setPermission'])->name('roles.set-permission')->middleware('permission:roles.update');
        Route::post('/roles/{role}/set-multiple-permissions', [RoleController::class, 'setMultiplePermissions'])->name('roles.set-multiple-permissions')->middleware('permission:roles.update');
    });

    //Sat:
    Route::get('/sat', [SatController::class, 'index'])->name('sat.index')->middleware('permission:sat.index');

    //Sat Patterns:
    Route::get('/sat-patterns', [SatPatternController::class, 'index'])->name('sat-patterns.index')->middleware('permission:sat-patterns.index');

    //Schedule Event Types:
    Route::get('/schedule-event-types', [ScheduleEventTypeController::class, 'index'])->name('schedule-event-types.index');

    //Schedules:
    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index')->middleware('permission:schedules.index');

    //Seats:
    Route::middleware('module_setted:accounting')->group(function (){
        Route::get('/seats', [SeatController::class, 'index'])->name('seats.index')->middleware('permission:seats.index');
    });

    //Shipment Patterns:
    Route::middleware('module_setted:logistics')->group(function (){
        Route::get('/shipment-patterns', [ShipmentPatternController::class, 'index'])->name('shipment-patterns.index')->middleware('permission:shipment-patterns.index');
    });

    //Shipments:
    Route::middleware('module_setted:logistics')->group(function (){
        Route::get('/shipments', [ShipmentController::class, 'index'])->name('shipments.index')->middleware('permission:shipments.index');
    });

    //Staff Picks:
    Route::get('/staff-pick', [StaffPickController::class, 'index'])->name('staff-pick.index')->middleware('permission:staff-pick.index');

    //Stock Movements:
    Route::middleware('module_setted:stocks')->group(function (){
        Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index')->middleware('permission:stock-movements.index');
        Route::get('/stock-movements/filtered-data', [StockMovementController::class, 'filteredData'])->name('stock-movements.filtered-data')->middleware('permission:stock-movements.index');
        Route::get('/stock-movements/create', [StockMovementController::class, 'create'])->name('stock-movements.create')->middleware('permission:stock-movements.create');
        Route::post('/stock-movements/store', [StockMovementController::class, 'store'])->name('stock-movements.store')->middleware('permission:stock-movements.create');
        Route::get('/stock-movements/{movement}/edit', [StockMovementController::class, 'edit'])->name('stock-movements.edit')->middleware('permission:stock-movements.edit');
        Route::put('/stock-movements/{movement}/update', [StockMovementController::class, 'update'])->name('stock-movements.update')->middleware('permission:stock-movements.update');
        Route::delete('/stock-movements/{movement}', [StockMovementController::class, 'destroy'])->name('stock-movements.destroy')->middleware('permission:stock-movements.destroy');
        Route::post('stock-movements/status', [StockMovementController::class, 'status'])->name('stock-movements.status')->middleware('permission:stock-movements.edit');
    });

    //Stocks:
    Route::middleware('module_setted:stocks')->group(function (){
        Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index')->middleware('permission:stocks.index');
    });

    //Stores:
    Route::get('/stores', [StoreController::class, 'index'])->name('stores.index')->middleware('permission:stores.index');

    //Teams:
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index')->middleware('permission:teams.index');

    //Towns:
    Route::middleware('module_setted:settings')->group(function (){
        Route::get('/towns/{province}', [TownController::class, 'index'])->name('towns.index')->middleware('permission:towns.index');
        Route::get('/towns/filtered-data/{province}', [TownController::class, 'filteredData'])->name('towns.filtered-data')->middleware('permission:towns.index');
        Route::get('/towns/{province}/create', [TownController::class, 'create'])->name('towns.create')->middleware('permission:towns.create');
        Route::post('/towns', [TownController::class, 'store'])->name('towns.store')->middleware('permission:towns.create');
        Route::get('/towns/{town}/edit', [TownController::class, 'edit'])->name('towns.edit')->middleware('permission:towns.edit');
        Route::put('/towns/{town}', [TownController::class, 'update'])->name('towns.update')->middleware('permission:towns.update');
        Route::delete('/towns/{town}', [TownController::class, 'destroy'])->name('towns.destroy')->middleware('permission:towns.destroy');
        Route::post('/towns/status', [TownController::class, 'status'])->name('towns.status')->middleware('permission:towns.edit');
    });

    //Units:
    Route::get('/units', [UnitController::class, 'index'])->name('units.index')->middleware('permission:units.index');
    Route::get('/units/filtered-data', [UnitController::class, 'filteredData'])->name('units.filtered-data')->middleware('permission:units.index');
    Route::get('/units/create', [UnitController::class, 'create'])->name('units.create')->middleware('permission:units.create');
    Route::post('/units/store', [UnitController::class, 'store'])->name('units.store')->middleware('permission:units.create');
    Route::get('/units/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit')->middleware('permission:units.edit');
    Route::put('/units/{unit}/update', [UnitController::class, 'update'])->name('units.update')->middleware('permission:units.update');
    Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy')->middleware('permission:units.destroy');
    Route::post('units/status', [UnitController::class, 'status'])->name('units.status')->middleware('permission:units.edit');

    //User Column Preferences:  No requiere permisos.
    Route::get('/column-preferences', [UserColumnPreferenceController::class, 'index'])->name('column-preferences.index');
    Route::post('/column-preferences', [UserColumnPreferenceController::class, 'store'])->name('column-preferences.store');

    //Users:
    Route::get('/users/{company_id?}', [UserController::class, 'index'])->name('users.index')->where('company_id', '[0-9]+')->middleware('permission:users.index');
    Route::get('/users/filtered-data', [UserController::class, 'filteredData'])->name('users.filtered-data')->middleware('permission:users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create')->middleware('permission:users.create');
    Route::post('/users/store', [UserController::class, 'store'])->name('users.store')->middleware('permission:users.create');
    Route::get('/users/{user}/edit{profile?}', [UserController::class, 'edit'])->name('users.edit')->middleware('permission:users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:users.destroy');
    Route::post('users/status', [UserController::class, 'status'])->name('users.status')->middleware('permission:users.edit');
    Route::delete('/users/{user}/signature', [UserController::class, 'deleteSignature'])->name('users.signature.delete')->middleware('permission:users.edit');
    Route::put('/users/{user}/update-pwd', [UserController::class, 'updatePwd'])->name('users.pwd.update')->middleware('permission:users.edit');

    //Users Profile:
    Route::get('/profile', [UserController::class, 'editProfile'])->name('profile.edit')->middleware('permission:users.edit');

    //Vehicles:
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index')->middleware('permission:vehicles.index');

    //Work Order Patterns:
    Route::get('/work-order-patterns', [WorkOrderPatternController::class, 'index'])->name('work-order-patterns.index')->middleware('permission:work-order-patterns.index');

    //Work Orders:
    Route::get('/work-orders', [WorkOrderController::class, 'index'])->name('work-orders.index')->middleware('permission:work-orders.index');

    //Workplaces:
    Route::middleware('module_setted:companies')->group(function (){
        Route::get('/workplaces', [WorkplaceController::class, 'index'])->name('workplaces.index')->middleware('permission:workplaces.index');
        Route::get('/workplaces/filtered-data', [WorkplaceController::class, 'filteredData'])->name('workplaces.filtered-data')->middleware('permission:workplaces.index');
        Route::get('/workplaces/create', [WorkplaceController::class, 'create'])->name('workplaces.create')->middleware('permission:workplaces.create');
        Route::post('/workplaces/store', [WorkplaceController::class, 'store'])->name('workplaces.store')->middleware('permission:workplaces.create');
        Route::get('/workplaces/{workplace}/edit', [WorkplaceController::class, 'edit'])->name('workplaces.edit')->middleware('permission:workplaces.edit');
        Route::put('/workplaces/{workplace}/update', [WorkplaceController::class, 'update'])->name('workplaces.update')->middleware('permission:workplaces.update');
        Route::delete('/workplaces/{workplace}', [WorkplaceController::class, 'destroy'])->name('workplaces.destroy')->middleware('permission:workplaces.destroy');
        Route::delete('/workplaces/{workplace}/logo', [WorkplaceController::class, 'deleteLogo'])->name('workplaces.logo.delete')->middleware('permission:workplaces.edit');
        Route::post('workplaces/status', [WorkplaceController::class, 'status'])->name('workplaces.status')->middleware('permission:workplaces.edit');
    });
});

Route::middleware('auth')->group(function(){
    
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
