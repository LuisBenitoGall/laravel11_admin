<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Models
use App\Models\Province;
use App\Models\Town;

//Admin:
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\WpFormController;

Route::middleware(['web', 'auth'])->prefix('admin')->group(function(){   
    //Content
    Route::get('/content/{code}', [ContentController::class, 'info']);

});

// Simple API endpoints for dynamic location selects (used by frontend LocationSelects component)
// Example: GET /api/provinces?country_id=1
Route::get('/provinces', function(Request $request) {
    $countryId = $request->query('country_id');
    if (!$countryId) {
        return response()->json([]);
    }

    $provinces = Province::where('country_id', $countryId)->orderBy('name')->get(['id', 'name']);
    return response()->json($provinces);
});

// Example: GET /api/towns?province_id=1
Route::get('/towns', function(Request $request) {
    $provinceId = $request->query('province_id');
    if (!$provinceId) {
        return response()->json([]);
    }

    $towns = Town::where('province_id', $provinceId)->orderBy('name')->get(['id', 'name']);
    return response()->json($towns);
});

// GET /api/town/{id} -> return town with province_id (and optionally country via relationship)
Route::get('/town/{id}', function($id) {
    $town = Town::with('province')->find($id);
    if (!$town) return response()->json(null, 404);

    // Attempt to include country_id if relationship chain exists
    $province = $town->province;
    $countryId = $province && isset($province->country_id) ? $province->country_id : null;

    return response()->json([
        'id' => $town->id,
        'name' => $town->name,
        'province_id' => $town->province_id,
        'country_id' => $countryId
    ]);
});

// Formularios desde WP:
Route::post('/wp/contact-es', [WpFormController::class, 'contact'])
    ->name('wp.contact-es')->defaults('lang', 'es');

Route::post('/wp/contact-en', [WpFormController::class, 'contact'])
    ->name('wp.contact-en')->defaults('lang', 'en');

Route::post('/wp/newsletter-es', [WpFormController::class, 'newsletter'])
    ->name('wp.newsletter-es')->defaults('lang', 'es');

Route::post('/wp/newsletter-en', [WpFormController::class, 'newsletter'])
    ->name('wp.newsletter-en')->defaults('lang', 'en');

Route::post('/wp/felipao', [WpFormController::class, 'felipao'])
    ->name('wp.felipao');


//Endpoints:
// https://crm.realfabricadetapices.com/api/wp/contact-es
// https://crm.realfabricadetapices.com/api/wp/contact-en
// https://crm.realfabricadetapices.com/api/wp/newsletter-es
// https://crm.realfabricadetapices.com/api/wp/newsletter-en
// https://crm.realfabricadetapices.com/api/wp/felipao

