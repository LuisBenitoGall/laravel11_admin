<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnsureUserIsAdminTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function non_admin_cannot_login(): void
    {
        $user = User::factory()->create([
            'isAdmin' => false,
            'password' => bcrypt('password'),
        ]);

        $response = $this->from(route('login'))->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    /** @test */
    public function non_admin_is_logged_out_from_admin_dashboard(): void
    {
        $user = User::factory()->create(['isAdmin' => false]);
        $company = Company::factory()->create(['status' => 1]);
        $user->companies()->attach($company->id, ['position' => 'test']);

        $response = $this->actingAs($user)
            ->withSession(['currentCompany' => $company->id])
            ->get(route('dashboard.index'));

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('alert');
        $this->assertGuest();
    }

    /** @test */
    public function admin_can_reach_dashboard_when_company_set(): void
    {
        $user = User::factory()->create(['isAdmin' => true]);
        $company = Company::factory()->create(['status' => 1]);
        $user->companies()->attach($company->id, ['position' => 'test']);

        $response = $this->actingAs($user)
            ->withSession(['currentCompany' => $company->id])
            ->get(route('dashboard.index'));

        $response->assertOk();
        $this->assertAuthenticatedAs($user);
    }
}
