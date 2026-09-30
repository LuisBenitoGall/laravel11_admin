<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\MarketingList;
use App\Models\User;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MarketingListsIndexCreatedAtTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Company $company;

    private MarketingList $list;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $this->actor = User::factory()->create();
        $this->actor->assignRole('Super Admin');

        $this->company = Company::factory()->create([
            'status' => 1,
            'created_by' => $this->actor->id,
            'updated_by' => $this->actor->id,
        ]);
        $this->actor->companies()->attach($this->company->id, ['position' => 'test']);

        $this->list = MarketingList::factory()->create([
            'company_id' => $this->company->id,
            'owner_id' => $this->actor->id,
            'created_by' => $this->actor->id,
            'updated_by' => $this->actor->id,
            'created_at' => Carbon::parse('2026-03-15 10:30:00'),
            'updated_at' => Carbon::parse('2026-03-15 10:30:00'),
        ]);

        app(CompanyContext::class)->set($this->company->id);
    }

    private function getIndex(string $locale)
    {
        return $this->actingAs($this->actor)
            ->withSession([
                'currentCompany' => $this->company->id,
                'locale' => $locale,
            ])
            ->get(route('marketing-lists.index'));
    }

    /** @test */
    public function index_created_at_uses_d_m_y_for_spanish_locale(): void
    {
        $response = $this->getIndex('es');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/MarketingList/Index')
            ->has('lists.data', 1)
            ->where('lists.data.0.id', $this->list->id)
            ->where('lists.data.0.created_at', '15/03/2026')
            ->where('lists.data.0.created_at', fn ($v) => ! preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $v))
        );
    }

    /** @test */
    public function index_created_at_uses_y_m_d_for_english_locale(): void
    {
        $response = $this->getIndex('en');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/MarketingList/Index')
            ->has('lists.data', 1)
            ->where('lists.data.0.id', $this->list->id)
            ->where('lists.data.0.created_at', '2026/03/15')
            ->where('lists.data.0.created_at', fn ($v) => ! preg_match('/^\d{4}-\d{2}-\d{2}/', (string) $v))
        );
    }

    /** @test */
    public function index_filters_lists_by_created_at_date_range(): void
    {
        $outside = MarketingList::factory()->create([
            'name' => 'Lista fuera de rango',
            'slug' => 'lista-fuera-de-rango',
            'company_id' => $this->company->id,
            'owner_id' => $this->actor->id,
            'created_by' => $this->actor->id,
            'updated_by' => $this->actor->id,
            'created_at' => Carbon::parse('2026-01-10 08:00:00'),
            'updated_at' => Carbon::parse('2026-01-10 08:00:00'),
        ]);

        $response = $this->actingAs($this->actor)
            ->withSession([
                'currentCompany' => $this->company->id,
                'locale' => 'es',
            ])
            ->get(route('marketing-lists.index', [
                'date_from' => '2026-03-01',
                'date_to' => '2026-03-31',
            ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/MarketingList/Index')
            ->has('lists.data', 1)
            ->where('lists.data.0.id', $this->list->id)
        );

        $this->assertTrue(
            MarketingList::where('id', $outside->id)->exists(),
            'La lista fuera de rango debe seguir existiendo; solo se filtra el índice.'
        );
    }

    /** @test */
    public function index_date_from_only_excludes_earlier_created_lists(): void
    {
        MarketingList::factory()->create([
            'name' => 'Lista anterior',
            'slug' => 'lista-anterior',
            'company_id' => $this->company->id,
            'owner_id' => $this->actor->id,
            'created_by' => $this->actor->id,
            'updated_by' => $this->actor->id,
            'created_at' => Carbon::parse('2026-02-01 12:00:00'),
            'updated_at' => Carbon::parse('2026-02-01 12:00:00'),
        ]);

        $response = $this->actingAs($this->actor)
            ->withSession([
                'currentCompany' => $this->company->id,
                'locale' => 'es',
            ])
            ->get(route('marketing-lists.index', [
                'date_from' => '2026-03-15',
            ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/MarketingList/Index')
            ->has('lists.data', 1)
            ->where('lists.data.0.id', $this->list->id)
        );
    }
}
