<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\CustomerProvider;
use App\Models\Module;
use App\Models\User;
use App\Models\UserCompany;
use App\Support\CompanyContext;
use App\Support\DataStandards\NifNormalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CustodyIntakeIdentityTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Company $provider;

    protected function setUp(): void
    {
        parent::setUp();

        Module::firstOrCreate(['slug' => 'logistics'], [
            'name' => 'logistics',
            'label' => 'logistics',
            'color' => '#3788d8',
            'icon' => 'truck',
            'level' => '2',
            'translations' => ['es' => 'Logística'],
            'status' => 1,
        ]);

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        Account::firstOrCreate(
            ['slug' => 'free'],
            ['name' => 'Free', 'rate' => 0, 'status' => 1]
        );

        $this->actor = User::factory()->create();
        $this->actor->assignRole('Super Admin');
        $this->provider = Company::factory()->create(['status' => 1, 'nif' => 'B12345678']);
        $this->actor->companies()->attach($this->provider->id, ['position' => 'test']);

        app(CompanyContext::class)->set($this->provider->id);
    }

    private function sessionRequest()
    {
        return $this->actingAs($this->actor)
            ->withSession(['currentCompany' => $this->provider->id]);
    }

    /** @test */
    public function company_customer_provider_regression(): void
    {
        $customer = Company::factory()->create(['status' => 1, 'nif' => 'A11111111']);

        $relation = CustomerProvider::ensureCompanyCustomer(
            $customer->id,
            $this->provider->id,
            $this->actor->id
        );

        $this->assertNotNull($relation->id);
        $this->assertSame((int) $customer->id, (int) $relation->customer_id);
        $this->assertSame((int) $this->provider->id, (int) $relation->provider_id);
        $this->assertNull($relation->user_customer_id);
        $this->assertTrue(CustomerProvider::isMyCustomer($this->provider->id, $customer->id));
    }

    /** @test */
    public function user_customer_provider_xor(): void
    {
        $user = User::factory()->create(['nif' => '12345678Z']);

        $relation = CustomerProvider::ensureUserCustomer(
            $user->id,
            $this->provider->id,
            $this->actor->id
        );

        $this->assertNotNull($relation->id);
        $this->assertNull($relation->customer_id);
        $this->assertSame((int) $user->id, (int) $relation->user_customer_id);
        $this->assertSame((int) $this->provider->id, (int) $relation->provider_id);
        $this->assertTrue(CustomerProvider::isMyCustomerUser($this->provider->id, $user->id));

        $this->expectException(InvalidArgumentException::class);
        $bad = new CustomerProvider();
        $bad->customer_id = $this->provider->id;
        $bad->user_customer_id = $user->id;
        $bad->provider_id = $this->provider->id;
        $bad->save();
    }

    /** @test */
    public function existing_profile_ensures_cp_without_crm_writes(): void
    {
        $nif = NifNormalizer::normalize('B87654321');
        $customer = Company::factory()->create(['status' => 1, 'nif' => $nif]);

        $accountsBefore = CrmAccount::count();
        $contactsBefore = CrmContact::count();

        $response = $this->sessionRequest()->post(route('logistics.intake-identity.ensure'), [
            'type' => 'company',
            'id' => $customer->id,
        ]);

        $response->assertRedirect(route('logistics.intake-identity'));
        $this->assertTrue(
            CustomerProvider::where('customer_id', $customer->id)
                ->where('provider_id', $this->provider->id)
                ->whereNull('user_customer_id')
                ->exists()
        );
        $this->assertSame($accountsBefore, CrmAccount::count());
        $this->assertSame($contactsBefore, CrmContact::count());
    }

    /** @test */
    public function existing_user_ensures_cp_without_crm_writes(): void
    {
        $user = User::factory()->create([
            'email' => 'existente@example.com',
            'nif' => '99887766A',
        ]);

        $accountsBefore = CrmAccount::count();
        $contactsBefore = CrmContact::count();

        $response = $this->sessionRequest()->post(route('logistics.intake-identity.ensure'), [
            'type' => 'user',
            'id' => $user->id,
        ]);

        $response->assertRedirect(route('logistics.intake-identity'));
        $this->assertTrue(CustomerProvider::isMyCustomerUser($this->provider->id, $user->id));
        $this->assertSame($accountsBefore, CrmAccount::count());
        $this->assertSame($contactsBefore, CrmContact::count());
    }

    /** @test */
    public function create_company_creates_account_linked_and_cp(): void
    {
        $companiesBefore = Company::count();
        $accountsBefore = CrmAccount::count();

        $response = $this->sessionRequest()->post(route('logistics.intake-identity.store'), [
            'type' => 'company',
        ]);

        $response->assertRedirect(route('logistics.intake-identity'));
        $this->assertSame($companiesBefore + 1, Company::count());
        $this->assertSame($accountsBefore + 1, CrmAccount::count());

        $company = Company::orderByDesc('id')->first();
        $this->assertSame('Anónimo', $company->name);
        $this->assertNull($company->nif);

        $account = CrmAccount::where('company_id', $this->provider->id)
            ->where('linked_company_id', $company->id)
            ->first();
        $this->assertNotNull($account);

        $cp = CustomerProvider::where('customer_id', $company->id)
            ->where('provider_id', $this->provider->id)
            ->whereNull('user_customer_id')
            ->first();
        $this->assertNotNull($cp);
    }

    /** @test */
    public function create_user_without_user_companies_creates_contact_and_cp(): void
    {
        $usersBefore = User::count();
        $contactsBefore = CrmContact::count();

        $response = $this->sessionRequest()->post(route('logistics.intake-identity.store'), [
            'type' => 'user',
            'email' => 'nuevo.particular@example.com',
            'nif' => '11223344B',
        ]);

        $response->assertRedirect(route('logistics.intake-identity'));
        $this->assertSame($usersBefore + 1, User::count());
        $this->assertSame($contactsBefore + 1, CrmContact::count());

        $user = User::where('email', 'nuevo.particular@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('Anónimo', $user->name);

        $this->assertFalse(
            UserCompany::where('user_id', $user->id)
                ->where('company_id', $this->provider->id)
                ->exists()
        );

        $this->assertTrue(
            CrmContact::where('company_id', $this->provider->id)
                ->where('user_id', $user->id)
                ->exists()
        );
        $this->assertTrue(CustomerProvider::isMyCustomerUser($this->provider->id, $user->id));
    }

    /** @test */
    public function conflict_when_user_and_company_share_nif_does_not_auto_choose(): void
    {
        $nif = '55667788C';
        Company::factory()->create(['status' => 1, 'nif' => NifNormalizer::normalize($nif)]);
        User::factory()->create(['nif' => $nif, 'email' => 'conflicto@example.com']);

        $response = $this->sessionRequest()->post(route('logistics.intake-identity.search'), [
            'type' => 'company',
            'nif' => $nif,
        ]);

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Logistics/IntakeIdentity')
            ->where('result.status', 'conflict')
            ->has('result.companies', 1)
            ->has('result.users', 1)
        );

        $this->assertSame(0, CustomerProvider::count());
    }

    /** @test */
    public function ensure_is_idempotent(): void
    {
        $customer = Company::factory()->create(['status' => 1, 'nif' => 'C99887766']);

        $this->sessionRequest()->post(route('logistics.intake-identity.ensure'), [
            'type' => 'company',
            'id' => $customer->id,
        ])->assertRedirect();

        $this->sessionRequest()->post(route('logistics.intake-identity.ensure'), [
            'type' => 'company',
            'id' => $customer->id,
        ])->assertRedirect();

        $this->assertSame(
            1,
            CustomerProvider::where('customer_id', $customer->id)
                ->where('provider_id', $this->provider->id)
                ->count()
        );
    }

    /** @test */
    public function index_requires_company_session_and_renders(): void
    {
        $this->sessionRequest()
            ->get(route('logistics.intake-identity'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Logistics/IntakeIdentity'));
    }
}
