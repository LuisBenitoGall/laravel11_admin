<?php

namespace App\Providers;

//Models:
use App\Models\Category;
use App\Models\CompanyNote;
use App\Models\Document;
use App\Models\CompanySetting;
use App\Models\CustomerProvider;
use App\Models\GoogleCalendarIntegration;
use App\Models\Product;
use App\Models\Schedule;
use App\Models\ScheduleEvent;

//Policies:
use App\Policies\CategoryPolicy;
use App\Policies\CompanyNotePolicy;
use App\Policies\DocumentPolicy;
use App\Policies\CompanySettingPolicy;
use App\Policies\CustomerProviderPolicy;
use App\Policies\GoogleCalendarIntegrationPolicy;
use App\Policies\ProductPolicy;
use App\Policies\ScheduleEventPolicy;
use App\Policies\SchedulePolicy;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as BaseAuthServiceProvider;

class AuthServiceProvider extends BaseAuthServiceProvider{
    /**
     * Mapea modelos → policies.
     */
    protected $policies = [
        Category::class => CategoryPolicy::class,
        CompanyNote::class => CompanyNotePolicy::class,
        Document::class => DocumentPolicy::class,
        CompanySetting::class => CompanySettingPolicy::class,
        CustomerProvider::class => CustomerProviderPolicy::class,
        GoogleCalendarIntegration::class => GoogleCalendarIntegrationPolicy::class,
        Product::class => ProductPolicy::class,
        Schedule::class => SchedulePolicy::class,
        ScheduleEvent::class => ScheduleEventPolicy::class
    ];

    public function boot(): void{
        $this->registerPolicies();
        // Aquí podrías definir Gates adicionales si los necesitas.
    }
}
