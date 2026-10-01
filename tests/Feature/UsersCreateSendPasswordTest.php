<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Support\CompanyContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Alinea Create.jsx → send_pwd con UserController::store.
 *
 * Nota: Mail::fake() no registra Mail::send('vista', ...); el controller usa
 * vista `emails.send-user-password`, así que se mockea Mail::send.
 */
class UsersCreateSendPasswordTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Company $company;

    private Role $role;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => config('constants.ROLE_INVITADO_NAME_'), 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'users.create', 'guard_name' => 'web']);

        $this->role = Role::firstOrCreate(['name' => 'Staff Test', 'guard_name' => 'web']);

        $this->actor = User::factory()->create();
        $this->actor->assignRole('Super Admin');

        $this->company = Company::factory()->create([
            'status' => 1,
            'name' => 'Empresa Test',
            'created_by' => $this->actor->id,
            'updated_by' => $this->actor->id,
        ]);
        $this->actor->companies()->attach($this->company->id, ['position' => 'test']);

        app(CompanyContext::class)->set($this->company->id);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function postStore(array $overrides = [])
    {
        $payload = array_merge([
            'name' => 'Nuevo',
            'surname' => 'Usuario',
            'email' => 'nuevo.usuario@example.com',
            'role' => $this->role->id,
            'status' => 1,
            'link_company' => 1,
        ], $overrides);

        return $this->actingAs($this->actor)
            ->withSession(['currentCompany' => $this->company->id])
            ->post(route('users.store'), $payload);
    }

    /** @test */
    public function send_pwd_true_sends_password_email_on_create(): void
    {
        Mail::shouldReceive('send')
            ->once()
            ->withArgs(function ($view, $data, $callback) {
                return $view === 'emails.send-user-password'
                    && is_array($data)
                    && ! empty($data['password'])
                    && is_string($data['usuario'] ?? null)
                    && str_contains($data['usuario'], 'Nuevo')
                    && is_callable($callback);
            });

        $response = $this->postStore(['send_pwd' => true]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'nuevo.usuario@example.com']);
    }

    /** @test */
    public function send_pwd_false_does_not_send_password_email(): void
    {
        Mail::shouldReceive('send')->never();

        $response = $this->postStore(['send_pwd' => false]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'nuevo.usuario@example.com']);
    }

    /** @test */
    public function send_pwd_absent_does_not_send_password_email(): void
    {
        Mail::shouldReceive('send')->never();

        $response = $this->postStore([
            'email' => 'sin.flag@example.com',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'sin.flag@example.com']);
    }

    /** @test */
    public function send_pwd_mail_failure_still_creates_user_without_500(): void
    {
        Mail::shouldReceive('send')
            ->once()
            ->andThrow(new \RuntimeException('SMTP connection refused'));

        $response = $this->postStore([
            'send_pwd' => true,
            'email' => 'mail.fail@example.com',
        ]);

        $response->assertRedirect(route('users.edit', User::where('email', 'mail.fail@example.com')->first()));
        $response->assertSessionHas('msg');
        $response->assertSessionHas('alert');
        $this->assertDatabaseHas('users', ['email' => 'mail.fail@example.com']);
    }
}
