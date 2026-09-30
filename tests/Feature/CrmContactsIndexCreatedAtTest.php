<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CrmContact;
use App\Models\Module;
use App\Models\User;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CrmContactsIndexCreatedAtTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Company $company;

    private User $contactUser;

    protected function setUp(): void
    {
        parent::setUp();

        Module::firstOrCreate(['slug' => 'crm'], [
            'name' => 'crm',
            'label' => 'crm',
            'color' => '#3788d8',
            'icon' => 'users',
            'level' => '2',
            'translations' => ['es' => 'CRM'],
            'status' => 1,
        ]);

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'crm-contacts.index', 'guard_name' => 'web']);

        $this->actor = User::factory()->create();
        $this->actor->assignRole('Super Admin');

        $this->company = Company::factory()->create(['status' => 1]);
        $this->actor->companies()->attach($this->company->id, ['position' => 'test']);

        $this->contactUser = User::factory()->create([
            'name' => 'Contacto',
            'surname' => 'Prueba',
            'email' => 'contacto.creado@example.com',
            'created_at' => Carbon::parse('2026-03-15 10:30:00'),
            'updated_at' => Carbon::parse('2026-03-15 10:30:00'),
        ]);

        CrmContact::create([
            'company_id' => $this->company->id,
            'user_id' => $this->contactUser->id,
            'contact_type' => 'cli',
            'status' => 1,
        ]);

        app(CompanyContext::class)->set($this->company->id);
    }

    private function getIndex(string $locale, array $query = [])
    {
        // SQLite de tests no tiene CONCAT; usar sort por created_at (allowlist de este change)
        $query = array_merge([
            'sort_field' => 'created_at',
            'sort_direction' => 'asc',
        ], $query);

        return $this->actingAs($this->actor)
            ->withSession([
                'currentCompany' => $this->company->id,
                'company_id' => $this->company->id,
                'companyModules' => ['crm'],
                'locale' => $locale,
            ])
            ->get(route('crm-contacts.index', $query));
    }

    /** @test */
    public function index_created_at_uses_d_m_y_for_spanish_locale(): void
    {
        $response = $this->getIndex('es');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/CrmContact/Index')
            ->has('table.rows.data', 1)
            ->where('table.rows.data.0.id', $this->contactUser->id)
            ->where('table.rows.data.0.created_at', '15/03/2026')
            ->where('table.rows.data.0.created_at', fn ($v) => ! preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $v))
        );
    }

    /** @test */
    public function index_created_at_uses_y_m_d_for_english_locale(): void
    {
        $response = $this->getIndex('en');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/CrmContact/Index')
            ->has('table.rows.data', 1)
            ->where('table.rows.data.0.id', $this->contactUser->id)
            ->where('table.rows.data.0.created_at', '2026/03/15')
            ->where('table.rows.data.0.created_at', fn ($v) => ! preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $v))
        );
    }

    /** @test */
    public function date_from_date_to_filters_by_users_created_at(): void
    {
        $outside = User::factory()->create([
            'name' => 'Fuera',
            'surname' => 'Rango',
            'email' => 'fuera.rango@example.com',
            'created_at' => Carbon::parse('2025-01-01 08:00:00'),
            'updated_at' => Carbon::parse('2025-01-01 08:00:00'),
        ]);
        CrmContact::create([
            'company_id' => $this->company->id,
            'user_id' => $outside->id,
            'contact_type' => 'cli',
            'status' => 1,
        ]);

        $response = $this->getIndex('es', [
            'date_from' => '2026-03-01',
            'date_to' => '2026-03-31',
        ]);

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/CrmContact/Index')
            ->has('table.rows.data', 1)
            ->where('table.rows.data.0.id', $this->contactUser->id)
            ->where('table.queryParams.date_from', '2026-03-01')
            ->where('table.queryParams.date_to', '2026-03-31')
        );
    }
}
