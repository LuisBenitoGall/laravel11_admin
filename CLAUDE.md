# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Real Fábrica de Tapices (RFT)** — a multi-tenant ERP system for a construction materials distributor. Core modules: Catalog, Sales, Purchases, Warehouse, Logistics, Invoicing, Treasury, Accounting, CRM (Dynamics 365 integration), and Reporting.

Stack: Laravel 11 (PHP 8.2+), Inertia.js, React (JSX), Bootstrap + SCSS, SQLite (dev) / MySQL (prod), Redis (optional).

## Common Commands

### Development
```bash
# Start dev servers (Vite + Laravel)
npm run dev
php artisan serve

# Reset DB with fresh migrations + seeds
composer run dev:reset   # runs migrate:fresh --seed + optimize:clear

# Run scheduled tasks locally
php artisan schedule:work
```

### Tests
```bash
# Run all tests (SQLite :memory:)
./vendor/bin/phpunit

# Run a single test file
./vendor/bin/phpunit tests/Feature/SomeTest.php

# Run a single test method
./vendor/bin/phpunit --filter testMethodName

# E2E Playwright (Laragon + Vite deben estar arriba; no arranca webServer)
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
# Override: PLAYWRIGHT_BASE_URL=http://laravel11_admin.test
```

### Code Style
```bash
# Laravel Pint (PSR-12)
./vendor/bin/pint

# Check without fixing
./vendor/bin/pint --test
```

### Frontend Build
```bash
npm run build         # production assets
```

### CRM Import (Dynamics 365 sync)
```bash
php artisan crm:import-accounts [--dry-run]
php artisan crm:promote-accounts
php artisan crm:import-contacts [--dry-run]
php artisan crm:promote-contacts
# Additional crm:* commands exist for campaigns, marketing lists, opportunities
```

## Architecture

### Multi-Company (Core Invariant)
Every query must be scoped to the active company. The `CompanyContext` (in `app/Support/CompanyContext.php`) is a scoped singleton holding `company_id`. Middleware `SetCompanyContext` and `EnsureCurrentCompany` initialize and guard it per request. The active company is stored in the session.

### Authorization
- Spatie `laravel-permission` with `HasRoles` trait on `User`
- `Gate::before()` grants Super Admin (role ID 1) all permissions — skip policy checks for superadmin
- Feature-level: `Policies/` cover instance-level authorization
- Permissions excluded from non-admins defined in `config/constants.php`

### Module System
Companies subscribe to modules. `ModuleSetted` middleware validates module availability per route. The `ModulesTrait` provides module access helpers in controllers.

### Inertia + React Frontend
- Entry: `resources/js/app.jsx` (client), `resources/js/ssr.jsx` (SSR)
- Page components: `resources/js/Pages/Admin/<Feature>/` (one directory per feature)
- Layouts: `resources/js/Layouts/Admin/` and `resources/js/Layouts/Frontend/`
- `HandleInertiaRequests` middleware shares global props (menu, flash messages, locale)
- i18n: `react-i18next` on frontend; `laravel-lang/common` on backend; locale from session
- UI: Bootstrap + custom SCSS (no Tailwind)

### Key Patterns
- **Controllers**: Thin — delegate to Services/Actions; use `Http/Requests/` for validation+authorization
- **Services**: `*Service` classes in `app/Services/` (GoogleCalendarService, DocumentService, Brevo/)
- **Filters**: `AdHocFilterApplier` macro (in `app/Support/Filters/`) dynamically applies query filters for table views
- **Traits**: `HasUserPermissionsTrait`, `ModulesTrait`, `LocaleTrait`, `ConvertDateTrait`
- Use eager loading; avoid N+1. Use DB transactions for multi-table operations.
- PHP 8.2+ features (enums, readonly, fibers) are encouraged when they improve clarity.

### CRM Integration
Dynamics 365 data is imported via Artisan commands into staging tables, then promoted to production models. See `app/Console/Commands/Migrations/` for the import/promote pattern.

### Third-Party Integrations
- **Brevo**: Email campaigns/transactional (`config/brevo.php`, `app/Services/Brevo/`)
- **Google Calendar**: `app/Services/GoogleCalendarService.php` (project: `myerp-483618`)
- **WordPress forms**: API endpoints in `routes/api.php`; config in `config/wp_forms.php`
- **Spreadsheets**: `phpoffice/phpspreadsheet` (PHP imports/templates); list exports in admin use **CSV** (`file-saver`), not ExcelJS
- **PDF**: `jspdf` + `jspdf-autotable`

## Important Config
- `config/constants.php`: Role IDs, pagination default (10), currency, permissions excluded for non-admins, date sentinel `9999-12-31`
- `config/permission.php`: Spatie table configuration
- `phpunit.xml`: Two suites (`Unit`, `Feature`), in-memory SQLite, coverage on `/app`
- `.env.example`: SQLite default, database sessions/cache, queue via database

## Naming Conventions
- DB tables/columns: `snake_case`
- Models: `PascalCase`
- Service classes: `*Service`, async work: `*Job`, domain events: `*Event`/`*Listener`
- Avoid global helpers; prefer scoped services and traits

## Redis Cache (Optional)
Secondary menus are cached per user/company: keys pattern `secondary_menu_user_*`. Manual invalidation: `redis-cli keys secondary_menu_user_* | xargs redis-cli del`.
