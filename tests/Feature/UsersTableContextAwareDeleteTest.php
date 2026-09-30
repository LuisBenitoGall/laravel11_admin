<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\Module;
use App\Models\User;
use App\Models\UserCompany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Cierra el contrato de c2026-02-24-users-table-delete sin cambiar la semántica
 * operativa ya en producción (desvincular contacto de cuenta vs soft-delete sin cuenta).
 */
class UsersTableContextAwareDeleteTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Company $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        Module::firstOrCreate(['slug' => 'crm'], [
            'name' => 'crm',
            'label' => 'crm',
            'color' => '#3788d8',
            'icon' => 'users',
            'level' => '2',
            'translations' => serialize(['es' => 'CRM']),
            'status' => 1,
            'active' => true,
        ]);

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        foreach (['crm-contacts.destroy', 'user-companies.edit', 'crm-accounts.edit', 'crm-contacts.index', 'users.edit'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $this->actor = User::factory()->create();
        $this->actor->assignRole('Super Admin');
        $this->tenant = Company::factory()->create(['status' => 1]);
        $this->actor->companies()->attach($this->tenant->id, ['position' => 'test']);
    }

    private function asTenantActor()
    {
        return $this->actingAs($this->actor)
            ->withSession([
                'currentCompany' => $this->tenant->id,
                'company_id' => $this->tenant->id,
                'companyModules' => ['crm'],
            ]);
    }

    private function makeAccount(array $overrides = []): CrmAccount
    {
        $account = new CrmAccount(array_merge([
            'company_id' => $this->tenant->id,
            'name' => 'Account',
            'status' => 1,
        ], $overrides));
        $account->created_by = $this->actor->id;
        $account->updated_by = $this->actor->id;
        $account->save();

        return $account;
    }

    /** @test */
    public function crm_contacts_destroy_unlinks_from_account_without_deleting_user_or_other_contacts(): void
    {
        $person = User::factory()->create();
        $linked = Company::factory()->create(['status' => 1]);

        $accountA = $this->makeAccount([
            'linked_company_id' => $linked->id,
            'name' => 'Account A',
        ]);
        $accountB = $this->makeAccount([
            'name' => 'Account B',
        ]);

        $contactA = CrmContact::create([
            'company_id' => $this->tenant->id,
            'user_id' => $person->id,
            'crm_account_id' => $accountA->id,
            'contact_type' => 'clp',
            'status' => 1,
        ]);
        $contactB = CrmContact::create([
            'company_id' => $this->tenant->id,
            'user_id' => $person->id,
            'crm_account_id' => $accountB->id,
            'contact_type' => 'clp',
            'status' => 1,
        ]);

        $uc = UserCompany::create([
            'user_id' => $person->id,
            'company_id' => $linked->id,
            'position' => 'sales',
        ]);

        $response = $this->asTenantActor()
            ->withHeaders(['X-Inertia' => 'true'])
            ->from(route('crm-accounts.edit', [$accountA->id, 'users']))
            ->delete(route('crm-contacts.destroy', $contactA));

        $response->assertRedirect(route('crm-accounts.edit', [$accountA->id, 'users']));

        $contactA->refresh();
        $this->assertNull($contactA->crm_account_id);
        $this->assertNull($contactA->deleted_at);

        $contactB->refresh();
        $this->assertSame($accountB->id, $contactB->crm_account_id);
        $this->assertNull($contactB->deleted_at);

        $this->assertDatabaseHas('users', ['id' => $person->id]);
        $this->assertSoftDeleted('user_companies', ['id' => $uc->id]);
    }

    /** @test */
    public function crm_contacts_destroy_soft_deletes_contact_without_account(): void
    {
        $person = User::factory()->create();
        $contact = CrmContact::create([
            'company_id' => $this->tenant->id,
            'user_id' => $person->id,
            'crm_account_id' => null,
            'contact_type' => 'clp',
            'status' => 1,
        ]);

        $response = $this->asTenantActor()
            ->withHeaders(['X-Inertia' => 'true'])
            ->from(route('crm-contacts.index'))
            ->delete(route('crm-contacts.destroy', $contact));

        $response->assertRedirect();
        $this->assertSoftDeleted('crm_contacts', ['id' => $contact->id]);
        $this->assertDatabaseHas('users', ['id' => $person->id]);
    }

    /** @test */
    public function user_companies_destroy_removes_only_that_pivot_and_keeps_user(): void
    {
        $person = User::factory()->create();
        $companyA = Company::factory()->create(['status' => 1]);
        $companyB = Company::factory()->create(['status' => 1]);

        $ucA = UserCompany::create([
            'user_id' => $person->id,
            'company_id' => $companyA->id,
            'position' => 'a',
        ]);
        $ucB = UserCompany::create([
            'user_id' => $person->id,
            'company_id' => $companyB->id,
            'position' => 'b',
        ]);

        $from = route('users.edit', $person->id);

        $response = $this->asTenantActor()
            ->withHeaders(['X-Inertia' => 'true'])
            ->from($from)
            ->delete(route('user-companies.destroy', $ucA));

        $response->assertRedirect($from);
        $this->assertSoftDeleted('user_companies', ['id' => $ucA->id]);
        $this->assertDatabaseHas('user_companies', ['id' => $ucB->id, 'deleted_at' => null]);
        $this->assertDatabaseHas('users', ['id' => $person->id]);
    }

    /** @test */
    public function crm_contacts_destroy_rejects_cross_company_contact(): void
    {
        $otherTenant = Company::factory()->create(['status' => 1]);
        $person = User::factory()->create();
        $contact = CrmContact::create([
            'company_id' => $otherTenant->id,
            'user_id' => $person->id,
            'crm_account_id' => null,
            'contact_type' => 'clp',
            'status' => 1,
        ]);

        $response = $this->asTenantActor()
            ->delete(route('crm-contacts.destroy', $contact));

        $response->assertStatus(404);
        $this->assertDatabaseHas('crm_contacts', ['id' => $contact->id, 'deleted_at' => null]);
    }
}
