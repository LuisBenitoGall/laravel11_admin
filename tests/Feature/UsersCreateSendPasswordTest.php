<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Notifications\SendUserPasswordNotification;
use App\Support\CompanyContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Create.jsx → send_pwd; envío vía Notification (misma config mail que reset password).
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
        Notification::fake();

        $response = $this->postStore(['send_pwd' => true]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'nuevo.usuario@example.com']);

        $created = User::where('email', 'nuevo.usuario@example.com')->first();
        $this->assertNotNull($created);

        Notification::assertSentTo(
            $created,
            SendUserPasswordNotification::class,
            function (SendUserPasswordNotification $notification) use ($created) {
                $mail = $notification->toMail($created);
                $html = $mail->render();

                return $mail->subject === __('contrasena_envio')
                    && str_contains($html, 'nuevo.usuario@example.com')
                    && str_contains($html, route('login'));
            }
        );
    }

    /** @test */
    public function send_pwd_false_does_not_send_password_email(): void
    {
        Notification::fake();

        $response = $this->postStore(['send_pwd' => false]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'nuevo.usuario@example.com']);
        Notification::assertNothingSent();
    }

    /** @test */
    public function send_pwd_absent_does_not_send_password_email(): void
    {
        Notification::fake();

        $response = $this->postStore([
            'email' => 'sin.flag@example.com',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'sin.flag@example.com']);
        Notification::assertNothingSent();
    }

    /** @test */
    public function send_pwd_mail_failure_still_creates_user_without_500(): void
    {
        // Forzar fallo de transporte (mismo tipo de error que un SMTP mal configurado)
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.transport' => 'smtp',
            'mail.mailers.smtp.host' => '127.0.0.1',
            'mail.mailers.smtp.port' => 9,
            'mail.mailers.smtp.timeout' => 1,
            'mail.mailers.smtp.username' => null,
            'mail.mailers.smtp.password' => null,
            'mail.mailers.smtp.encryption' => null,
        ]);

        $response = $this->postStore([
            'send_pwd' => true,
            'email' => 'mail.fail@example.com',
        ]);

        $user = User::where('email', 'mail.fail@example.com')->first();
        $this->assertNotNull($user);
        $response->assertRedirect(route('users.edit', $user));
        $response->assertSessionHas('msg');
        $response->assertSessionHas('alert');
    }
}
