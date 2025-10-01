<?php

//Frontend:
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Frontend\HomeController;

//Admin:
// use App\Http\Controllers\Admin\AccountingController;
use App\Http\Controllers\Admin\AccountingAccountTypeController;
use App\Http\Controllers\Admin\AccountingAccountController;
use App\Http\Controllers\Admin\AccountingConceptController;
use App\Http\Controllers\Admin\AccountingOptionController;
use App\Http\Controllers\Admin\AccountController;
// use App\Http\Controllers\Admin\AgencyController;
// use App\Http\Controllers\Admin\AmortizationLineController;
// use App\Http\Controllers\Admin\AmortizationController;
// use App\Http\Controllers\Admin\AnswerController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\BankAccountController;
use App\Http\Controllers\Admin\BankController;
// use App\Http\Controllers\Admin\BatchController;
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
// use App\Http\Controllers\Admin\ConcoursePattern;
use App\Http\Controllers\Admin\ContentController;
// use App\Http\Controllers\Admin\ContentImageController;
use App\Http\Controllers\Admin\ContractController;
use App\Http\Controllers\Admin\CostCenterController;
use App\Http\Controllers\Admin\CountryController;
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
// use App\Http\Controllers\Admin\IncidencePatternController;
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
Route::middleware(['web', 'auth'])->prefix('admin')->group(function(){
    //Accounting Account Types:
    Route::get('/accounting-account-types', [AccountingAccountTypeController::class, 'index'])->name('accounting-account-types.index');
    Route::get('/accounting-account-types/filtered-data', [AccountingAccountTypeController::class, 'filteredData'])->name('accounting-account-types.filtered-data');
    Route::get('/accounting-account-types/create', [AccountingAccountTypeController::class, 'create'])->name('accounting-account-types.create');
    Route::post('/accounting-account-types/store', [AccountingAccountTypeController::class, 'store'])->name('accounting-account-types.store');
    Route::get('/accounting-account-types/{type}/edit', [AccountingAccountTypeController::class, 'edit'])->name('accounting-account-types.edit');
    Route::put('/accounting-account-types/{type}', [AccountingAccountTypeController::class, 'update'])->name('accounting-account-types.update');
    Route::delete('/accounting-account-types/{type}', [AccountingAccountTypeController::class, 'destroy'])->name('accounting-account-types.destroy');

    //Accounting Accounts:
    Route::get('/accounting-accounts', [AccountingAccountController::class, 'index'])->name('accounting-accounts.index');

    //Accounting Concepts:
    Route::get('/accounting-concepts', [AccountingConceptController::class, 'index'])->name('accounting-concepts.index');

    //Accounting Options:
    Route::get('/accounting-options', [AccountingOptionController::class, 'index'])->name('accounting-options.index');

    //Accounts:
    Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::get('/accounts/filtered-data', [AccountController::class, 'filteredData'])->name('accounts.filtered-data');
    Route::get('/accounts/create', [AccountController::class, 'create'])->name('accounts.create');
    Route::post('/accounts/store', [AccountController::class, 'store'])->name('accounts.store');
    Route::get('/accounts/{account}/edit', [AccountController::class, 'edit'])->name('accounts.edit');
    Route::put('/accounts/{account}', [AccountController::class, 'update'])->name('accounts.update');
    Route::delete('/accounts/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy');
    Route::post('/accounts/status', [AccountController::class, 'status'])->name('accounts.status');

    //Agencies:
    Route::get('/agencies', [AgencyController::class, 'index'])->name('agencies.index');

    //Admin Dashboard:
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');

    //Attributes:
    Route::get('/attributes', [AttributeController::class, 'index'])->name('attributes.index');

    //Bank Accounts:
    Route::get('/bank-accounts', [BankAccountController::class, 'index'])->name('bank-accounts.index');

    //Banks:
    Route::get('/banks', [BankController::class, 'index'])->name('banks.index');
    Route::get('/banks/filtered-data', [BankController::class, 'filteredData'])->name('banks.filtered-data');
    Route::get('/banks/create', [BankController::class, 'create'])->name('banks.create');
    Route::post('/banks/store', [BankController::class, 'store'])->name('banks.store');
    Route::get('/banks/{bank}/edit', [BankController::class, 'edit'])->name('banks.edit');
    Route::put('/banks/{bank}', [BankController::class, 'update'])->name('banks.update');
    Route::post('/banks/status', [BankController::class, 'status'])->name('banks.status');
    Route::delete('/banks/{bank}', [BankController::class, 'destroy'])->name('banks.destroy');

    //Batch Patterns:
    Route::get('/batch-patterns', [BatchPatternController::class, 'index'])->name('batch-patterns.index');

    //Briefings:
    Route::get('/briefings', [BriefingController::class, 'index'])->name('briefings.index');

    //Briefings Items:
    Route::get('/briefing-items', [BriefingItemController::class, 'index'])->name('briefing-items.index');

    //Briefings Templates:
    Route::get('/briefing-templates', [BriefingTemplateController::class, 'index'])->name('briefing-templates.index');

    //Briefings Templates Items:
    Route::get('/briefing-templates-items', [BriefingTemplateItemController::class, 'index'])->name('briefing-templates-items.index');

    //Budget Forms:
    Route::get('/budget-forms', [BudgetFormController::class, 'index'])->name('budget-forms.index');

    //Budget Patterns:
    Route::get('/budget-patterns', [BudgetPatternController::class, 'index'])->name('budget-patterns.index');

    //Budget Settings:
    Route::get('/budget-settings', [BudgetSettingController::class, 'index'])->name('budget-settings.index');

    //Budgets:
    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');

    //Budgets From Providers:
    Route::get('/budgets-from-providers', [BudgetController::class, 'index'])->name('budgets-from-providers.index');

    //Business Areas:
    Route::get('/business-areas', [BusinessAreaController::class, 'index'])->name('business-areas.index');
    Route::get('/business-areas/filtered-data', [BusinessAreaController::class, 'filteredData'])->name('business-areas.filtered-data');
    Route::get('/business-areas/create', [BusinessAreaController::class, 'create'])->name('business-areas.create');
    Route::post('/business-areas/store', [BusinessAreaController::class, 'store'])->name('business-areas.store');
    Route::get('/business-areas/{business_area}/edit', [BusinessAreaController::class, 'edit'])->name('business-areas.edit');
    Route::put('/business-areas/{business_area}/update', [BusinessAreaController::class, 'update'])->name('business-areas.update');
    Route::delete('/business-areas/{business_area}', [BusinessAreaController::class, 'destroy'])->name('business-areas.destroy');
    Route::post('business-areas/status', [BusinessAreaController::class, 'status'])->name('business-areas.status');

    //Company:
    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/filtered-data', [CompanyController::class, 'filteredData'])->name('companies.filtered-data');
    Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create');
    Route::post('/companies/store', [CompanyController::class, 'store'])->name('companies.store');
    Route::get('/companies/{company}/edit', [CompanyController::class, 'edit'])->name('companies.edit');
    Route::put('/companies/{company}', [CompanyController::class, 'update'])->name('companies.update');
    Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy');
    Route::delete('/companies/{company}/logo', [CompanyController::class, 'deleteLogo'])->name('companies.logo.delete');
    Route::post('/companies/status', [CompanyController::class, 'status'])->name('companies.status');
    Route::get('/companies/{company}/select', [CompanyController::class, 'selectCompany'])->name('companies.select-get');
    Route::post('/companies/select', [CompanyController::class, 'selectCompanyPost'])->name('companies.select')->withoutMiddleware(VerifyCsrfToken::class);
    Route::get('/companies/refresh-session', [CompanyController::class, 'refreshSession'])->name('companies.refresh-session');

    //Company Accounts:
    Route::get('/company-accounts', [CompanyAccountController::class, 'index'])->name('company-accounts.index');
    Route::get('/company-accounts/filtered-data', [CompanyAccountController::class, 'filteredData'])->name('company-accounts.filtered-data');
    Route::get('/company-accounts/create', [CompanyAccountController::class, 'create'])->name('company-accounts.create');
    Route::delete('company-accounts/{account}', [CompanyAccountController::class, 'destroy'])->name('company-accounts.destroy');

    //Company Modules:
    Route::get('/company-modules', [CompanyModuleController::class, 'index'])->name('company-modules.index');
    Route::post('/company-modules/toggle/{module_id}', [CompanyModuleController::class, 'toggle'])->name('company-modules.toggle');

    //Company Settings:
    Route::get('/company-settings', [CompanySettingController::class, 'index'])->name('company-settings.index');

    //Concourse Patterns:
    Route::get('/concourse-patterns', [ConcoursePatternController::class, 'index'])->name('concourse-patterns.index');

    //Contents:
    Route::get('/contents', [ContentController::class, 'index'])->name('contents.index');
    Route::get('/contents/create', [ContentController::class, 'create'])->name('contents.create');
    Route::post('/contents/store', [ContentController::class, 'store'])->name('contents.store');
    Route::get('/contents/{content}/edit', [ContentController::class, 'edit'])->name('contents.edit');
    Route::put('/contents/{content}/update', [ContentController::class, 'update'])->name('contents.update');
    Route::delete('/contents/{content}', [ContentController::class, 'destroy'])->name('contents.destroy');
    Route::post('/contents/status', [ContentController::class, 'status'])->name('contents.status');

    //Contracts:
    Route::get('/contracts', [ContractController::class, 'index'])->name('contracts.index');

    //Control Panel:
    Route::get('/control-panel', [ControlPanelController::class, 'index'])->name('control-panel.index');

    //Cost Centers:
    Route::get('/cost-centers', [CostCenterController::class, 'index'])->name('cost-centers.index');
    Route::get('/cost-centers/filtered-data', [CostCenterController::class, 'filteredData'])->name('cost-centers.filtered-data');
    Route::get('/cost-centers/create', [CostCenterController::class, 'create'])->name('cost-centers.create');
    Route::post('/cost-centers/store', [CostCenterController::class, 'store'])->name('cost-centers.store');
    Route::get('/cost-centers/{cost_center}/edit', [CostCenterController::class, 'edit'])->name('cost-centers.edit');
    Route::put('/cost-centers/{cost_center}/update', [CostCenterController::class, 'update'])->name('cost-centers.update');
    Route::delete('/cost-centers/{cost_center}', [CostCenterController::class, 'destroy'])->name('cost-centers.destroy');
    Route::post('cost-centers/status', [CostCenterController::class, 'status'])->name('cost-centers.status');

    //Countries:
    Route::get('/countries', [CountryController::class, 'index'])->name('countries.index');
    Route::get('/countries/filtered-data', [CountryController::class, 'filteredData'])->name('countries.filtered-data');
    Route::get('/countries/create', [CountryController::class, 'create'])->name('countries.create');
    Route::post('/countries', [CountryController::class, 'store'])->name('countries.store');
    Route::get('/countries/{country}/edit', [CountryController::class, 'edit'])->name('countries.edit');
    Route::put('/countries/{country}', [CountryController::class, 'update'])->name('countries.update');
    Route::delete('/countries/{country}', [CountryController::class, 'destroy'])->name('countries.delete');
    Route::post('/countries/status', [CountryController::class, 'status'])->name('countries.status');

    //Currencies:
    Route::get('/currencies', [CurrencyController::class, 'index'])->name('currencies.index');
    Route::get('/currencies/filtered-data', [CurrencyController::class, 'filteredData'])->name('currencies.filtered-data');
    Route::get('/currencies/create', [CurrencyController::class, 'create'])->name('currencies.create');
    Route::post('/currencies', [CurrencyController::class, 'store'])->name('currencies.store');
    Route::get('/currencies/{currency}/edit', [CurrencyController::class, 'edit'])->name('currencies.edit');
    Route::put('/currencies/{currency}/update', [CurrencyController::class, 'update'])->name('currencies.update');
    Route::delete('/currencies/{currency}', [CurrencyController::class, 'destroy'])->name('currencies.destroy');
    Route::post('/currencies/status', [CurrencyController::class, 'status'])->name('currencies.status');

    //Customers:
    Route::get('/customers', [CustomerProviderController::class, 'customers'])->name('customers.index');

    //Deliveries:
    Route::get('/deliveries', [DeliveryController::class, 'index'])->name('deliveries.index');

    //Delivery Patterns:
    Route::get('/delivery-patterns', [DeliveryPatternController::class, 'index'])->name('delivery-patterns.index');

    //Effects:
    Route::get('/effects', [EffectController::class, 'index'])->name('effects.index');

    //Employees:
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');

    //Errors:
    Route::get('/forbidden', function () {
        return inertia('Errors/Forbidden', [
            'alert' => session('alert'),
        ]);
    })->name('error.403');

    //Expenses:
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');

    //Functionalities:
    Route::get('/functionalities', [FunctionalityController::class, 'index'])->name('functionalities.index');
    Route::get('/functionalities/filtered-data', [FunctionalityController::class, 'filteredData'])->name('functionalities.filtered-data');
    Route::post('/functionalities/store', [FunctionalityController::class, 'store'])->name('functionalities.store');
    Route::get('/functionalities/{functionality}/edit', [FunctionalityController::class, 'edit'])->name('functionalities.edit');
    Route::put('/functionalities/{functionality}/update', [FunctionalityController::class, 'update'])->name('functionalities.update');
    Route::delete('/functionalities/{functionality}', [FunctionalityController::class, 'destroy'])->name('functionalities.destroy');

    //Groups:
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');

    //Inventory:
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');

    //Invoice Patterns:
    Route::get('/invoice-patterns', [InvoicePatternController::class, 'index'])->name('invoice-patterns.index');

    //Invoice Queries:
    Route::get('/invoice-queries', [InvoiceQueryController::class, 'index'])->name('invoice-queries.index');

    //Invoice Settings:
    Route::get('/invoice-settings', [InvoiceSettingController::class, 'index'])->name('invoice-settings.index');

    //Invoices:
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');

    //Iva Types:
    Route::get('/iva-types', [IvaTypeController::class, 'index'])->name('iva-types.index');
    Route::get('/iva-types/filtered-data', [IvaTypeController::class, 'filteredData'])->name('iva-types.filtered-data');
    Route::get('/iva-types/create', [IvaTypeController::class, 'create'])->name('iva-types.create');
    Route::post('/iva-types/store', [IvaTypeController::class, 'store'])->name('iva-types.store');
    Route::get('/iva-types/{type}/edit', [IvaTypeController::class, 'edit'])->name('iva-types.edit');
    Route::put('/iva-types/{type}/update', [IvaTypeController::class, 'update'])->name('iva-types.update');
    Route::delete('/iva-types/{type}', [IvaTypeController::class, 'destroy'])->name('iva-types.destroy');
    Route::post('iva-types/status', [IvaTypeController::class, 'status'])->name('iva-types.status');

    //Modules:
    Route::get('/modules', [ModuleController::class, 'index'])->name('modules.index');
    Route::get('/modules/filtered-data', [ModuleController::class, 'filteredData'])->name('modules.filtered-data');
    Route::get('/modules/create', [ModuleController::class, 'create'])->name('modules.create');
    Route::post('/modules/store', [ModuleController::class, 'store'])->name('modules.store');
    Route::get('/modules/{module}/edit/{tab?}', [ModuleController::class, 'edit'])->name('modules.edit');
    Route::put('/modules/{module}/update', [ModuleController::class, 'update'])->name('modules.update');
    Route::delete('/modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy');
    Route::post('modules/status', [ModuleController::class, 'status'])->name('modules.status');

    //Order Categories:
    Route::get('/order-categories', [OrderCategoriesController::class, 'index'])->name('order-categories.index');

    //Order Groups:
    Route::get('/order-groups', [OrderGroupController::class, 'index'])->name('order-groups.index');

    //Order Patterns:
    Route::get('/order-patterns', [OrderPatternController::class, 'index'])->name('order-patterns.index');

    //Order Queries:
    Route::get('/order-queries', [OrderQueryController::class, 'index'])->name('order-queries.index');

    //Order Settings:
    Route::get('/order-settings', [OrderSettingController::class, 'index'])->name('order-settings.index');

    //Orders:
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

    //Payment Methods:
    Route::get('/payment-methods', [PaymentMethodController::class, 'index'])->name('payment-methods.index');

    //Permissions:
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::get('/permissions/filtered-data', [PermissionController::class, 'filteredData'])->name('permissions.filtered-data');
    Route::get('/permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
    Route::post('/permissions/store', [PermissionController::class, 'store'])->name('permissions.store');
    Route::get('/permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    //Planning:
    Route::get('/planning', [PlanningController::class, 'index'])->name('planning.index');

    //Procedure Patterns:
    Route::get('/procedure-patterns', [ProcedurePatternController::class, 'index'])->name('procedure-patterns.index');

    //Procedures:
    Route::get('/procedures', [ProcedureController::class, 'index'])->name('procedures.index');

    //Product Categories:
    Route::get('/product-categories', [CategoryController::class, 'index'])->name('product-categories.index');

    //Product Patterns:
    Route::get('/product-patterns', [ProductPatternController::class, 'index'])->name('product-patterns.index');
    Route::get('/product-patterns/filtered-data', [ProductPatternController::class, 'filteredData'])->name('product-patterns.filtered-data');
    Route::get('/product-patterns/create', [ProductPatternController::class, 'create'])->name('product-patterns.create');
    Route::post('/product-patterns/store', [ProductPatternController::class, 'store'])->name('product-patterns.store');
    Route::get('/product-patterns/{pattern}/edit', [ProductPatternController::class, 'edit'])->name('product-patterns.edit');
    Route::put('/product-patterns/{pattern}', [ProductPatternController::class, 'update'])->name('product-patterns.update');
    Route::delete('/product-patterns/{pattern}', [ProductPatternController::class, 'destroy'])->name('product-patterns.destroy');
    Route::post('/product-patterns/status', [ProductPatternController::class, 'status'])->name('product-patterns.status');

    //Products:
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/filtered-data', [ProductController::class, 'filteredData'])->name('products.filtered-data');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products/store', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/status', [ProductController::class, 'status'])->name('products.status');

    //Project Categories:
    Route::get('/project-categories', [CategoryController::class, 'index'])->name('project-categories.index');

    //Project Patterns:
    Route::get('/project-patterns', [ProjectPatternController::class, 'index'])->name('project-patterns.index');

    //Projects:
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');

    //Protocols:
    Route::get('/protocols', [ProtocolController::class, 'index'])->name('protocols.index');

    //Providers:
    Route::get('/providers', [CustomerProviderController::class, 'providers'])->name('providers.index');

    //Provinces:
    Route::get('/provinces/{country}', [ProvinceController::class, 'index'])->name('provinces.index');
    Route::get('/provinces/filtered-data/{country}', [ProvinceController::class, 'filteredData'])->name('provinces.filtered-data');
    Route::get('/provinces/{country}/create', [ProvinceController::class, 'create'])->name('provinces.create');
    Route::post('/provinces', [ProvinceController::class, 'store'])->name('provinces.store');
    Route::get('/provinces/{province}/edit', [ProvinceController::class, 'edit'])->name('provinces.edit');
    Route::put('/provinces/{province}', [ProvinceController::class, 'update'])->name('provinces.update');
    Route::delete('/provinces/{province}', [ProvinceController::class, 'destroy'])->name('provinces.destroy');
    Route::post('/provinces/status', [ProvinceController::class, 'status'])->name('provinces.status');

    //Purchase Patterns:
    Route::get('/purchase-patterns', [PurchasePatternController::class, 'index'])->name('purchase-patterns.index');

    //Purchase Products:
    Route::get('/purchase-products', [PurchaseProductController::class, 'index'])->name('purchase-products.index');

    //Receivings:
    Route::get('/receiving', [ReceivingController::class, 'index'])->name('receiving.index');

    //Remittance Patterns:
    Route::get('/remittance-patterns', [RemittancePatternController::class, 'index'])->name('remittance-patterns.index');

    //Remittances:
    Route::get('/remittances', [RemittanceController::class, 'index'])->name('remittances.index');

    //Roles:
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/filtered-data', [RoleController::class, 'filteredData'])->name('roles.filtered-data');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}/update', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::post('/roles/{role}/set-permission', [RoleController::class, 'setPermission'])->name('roles.set-permission');
    Route::post('/roles/{role}/set-multiple-permissions', [RoleController::class, 'setMultiplePermissions'])
    ->name('roles.set-multiple-permissions');

    //Sat:
    Route::get('/sat', [SatController::class, 'index'])->name('sat.index');

    //Sat Patterns:
    Route::get('/sat-patterns', [SatPatternController::class, 'index'])->name('sat-patterns.index');

    //Schedule Event Types:
    Route::get('/schedule-event-types', [ScheduleEventTypeController::class, 'index'])->name('schedule-event-types.index');

    //Schedules:
    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');

    //Seats:
    Route::get('/seats', [SeatController::class, 'index'])->name('seats.index');

    //Shipment Patterns:
    Route::get('/shipment-patterns', [ShipmentPatternController::class, 'index'])->name('shipment-patterns.index');

    //Shipments:
    Route::get('/shipments', [ShipmentController::class, 'index'])->name('shipments.index');

    //Staff Picks:
    Route::get('/staff-pick', [StaffPickController::class, 'index'])->name('staff-pick.index');

    //Stock Movements:
    Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');
    Route::get('/stock-movements/filtered-data', [StockMovementController::class, 'filteredData'])->name('stock-movements.filtered-data');
    Route::get('/stock-movements/create', [StockMovementController::class, 'create'])->name('stock-movements.create');
    Route::post('/stock-movements/store', [StockMovementController::class, 'store'])->name('stock-movements.store');
    Route::get('/stock-movements/{movement}/edit', [StockMovementController::class, 'edit'])->name('stock-movements.edit');
    Route::put('/stock-movements/{movement}/update', [StockMovementController::class, 'update'])->name('stock-movements.update');
    Route::delete('/stock-movements/{movement}', [StockMovementController::class, 'destroy'])->name('stock-movements.destroy');
    Route::post('stock-movements/status', [StockMovementController::class, 'status'])->name('stock-movements.status');

    //Stocks:
    Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index');

    //Stores:
    Route::get('/stores', [StoreController::class, 'index'])->name('stores.index');

    //Teams:
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');

    //Towns:
    Route::get('/towns/{province}', [TownController::class, 'index'])->name('towns.index');
    Route::get('/towns/filtered-data/{province}', [TownController::class, 'filteredData'])->name('towns.filtered-data');
    Route::get('/towns/{province}/create', [TownController::class, 'create'])->name('towns.create');
    Route::post('/towns', [TownController::class, 'store'])->name('towns.store');
    Route::get('/towns/{town}/edit', [TownController::class, 'edit'])->name('towns.edit');
    Route::put('/towns/{town}', [TownController::class, 'update'])->name('towns.update');
    Route::delete('/towns/{town}', [TownController::class, 'destroy'])->name('towns.destroy');
    Route::post('/towns/status', [TownController::class, 'status'])->name('towns.status');

    //Units:
    Route::get('/units', [UnitController::class, 'index'])->name('units.index');
    Route::get('/units/filtered-data', [UnitController::class, 'filteredData'])->name('units.filtered-data');
    Route::get('/units/create', [UnitController::class, 'create'])->name('units.create');
    Route::post('/units/store', [UnitController::class, 'store'])->name('units.store');
    Route::get('/units/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit');
    Route::put('/units/{unit}/update', [UnitController::class, 'update'])->name('units.update');
    Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
    Route::post('units/status', [UnitController::class, 'status'])->name('units.status');

    //User Column Preferences:
    Route::get('/column-preferences', [UserColumnPreferenceController::class, 'index'])->name('column-preferences.index');
    Route::post('/column-preferences', [UserColumnPreferenceController::class, 'store'])->name('column-preferences.store');

    //Users:
    Route::get('/users/{company_id?}', [UserController::class, 'index'])->name('users.index')->where('company_id', '[0-9]+');
    Route::get('/users/filtered-data', [UserController::class, 'filteredData'])->name('users.filtered-data');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users/store', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit{profile?}', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('users/status', [UserController::class, 'status'])->name('users.status');
    Route::delete('/users/{user}/signature', [UserController::class, 'deleteSignature'])->name('users.signature.delete');
    Route::put('/users/{user}/update-pwd', [UserController::class, 'updatePwd'])->name('users.pwd.update');

    //Users Profile:
    Route::get('/profile', [UserController::class, 'editProfile'])->name('profile.edit');

    //Vehicles:
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');

    //Work Order Patterns:
    Route::get('/work-order-patterns', [WorkOrderPatternController::class, 'index'])->name('work-order-patterns.index');

    //Work Orders:
    Route::get('/work-orders', [WorkOrderController::class, 'index'])->name('work-orders.index');

    //Workplaces:
    Route::get('/workplaces', [WorkplaceController::class, 'index'])->name('workplaces.index');
    Route::get('/workplaces/filtered-data', [WorkplaceController::class, 'filteredData'])->name('workplaces.filtered-data');
    Route::get('/workplaces/create', [WorkplaceController::class, 'create'])->name('workplaces.create');
    Route::post('/workplaces/store', [WorkplaceController::class, 'store'])->name('workplaces.store');
    Route::get('/workplaces/{workplace}/edit', [WorkplaceController::class, 'edit'])->name('workplaces.edit');
    Route::put('/workplaces/{workplace}/update', [WorkplaceController::class, 'update'])->name('workplaces.update');
    Route::delete('/workplaces/{workplace}', [WorkplaceController::class, 'destroy'])->name('workplaces.destroy');
    Route::delete('/workplaces/{workplace}/logo', [WorkplaceController::class, 'deleteLogo'])->name('workplaces.logo.delete');
    Route::post('workplaces/status', [WorkplaceController::class, 'status'])->name('workplaces.status');
});

Route::middleware('auth')->group(function(){
    
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
