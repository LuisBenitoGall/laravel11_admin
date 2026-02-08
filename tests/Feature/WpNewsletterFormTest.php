<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CrmContact;
use App\Models\CrmContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WpNewsletterFormTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // companies.created_by/updated_by exigen un user existente; el controlador usa company_id = 1.
        $user = User::factory()->create();
        Company::factory()->create([
            'id'          => 1,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    /** @test */
    public function it_returns_400_when_email_is_missing(): void
    {
        $response = $this->postJson('/api/wp/newsletter-form', [
            'field_nombre'   => 'Test',
            'field_apellidos' => 'User',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error'   => 'Missing email',
            ]);
    }

    /** @test */
    public function it_returns_400_when_email_is_empty(): void
    {
        $response = $this->postJson('/api/wp/newsletter-form', [
            'field_email' => '',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error'   => 'Missing email',
            ]);
    }

    /** @test */
    public function it_returns_400_when_email_is_invalid(): void
    {
        $response = $this->postJson('/api/wp/newsletter-form', [
            'field_email' => 'not-an-email',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error'   => 'Invalid email format',
            ]);
    }

    /** @test */
    public function it_returns_200_and_creates_user_contact_and_message_when_valid(): void
    {
        $response = $this->postJson('/api/wp/newsletter-form', [
            'field_nombre'    => 'Jane',
            'field_apellidos' => 'Doe',
            'field_email'     => 'jane.doe@example.com',
            'field_producto'  => 'Product A',
            'field_servicio'  => 'Service B',
            'lang'            => 'es',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'email' => 'jane.doe@example.com',
            'name'  => 'Jane',
            'surname' => 'Doe',
        ]);

        $user = User::where('email', 'jane.doe@example.com')->first();
        $this->assertNotNull($user);

        $this->assertDatabaseHas('crm_contacts', [
            'company_id'    => 1,
            'user_id'       => $user->id,
            'contact_type'  => 'newl',
        ]);

        $contact = CrmContact::where('user_id', $user->id)->first();
        $this->assertNotNull($contact);

        $this->assertDatabaseHas('crm_contact_messages', [
            'crm_contact_id' => $contact->id,
        ]);

        $msg = CrmContactMessage::where('crm_contact_id', $contact->id)->first();
        $this->assertNotNull($msg);
        $payload = json_decode($msg->message, true);
        $this->assertSame('Product A', $payload['producto'] ?? null);
        $this->assertSame('Service B', $payload['servicio'] ?? null);
    }

    /** @test */
    public function it_returns_200_and_reuses_existing_user_when_email_exists(): void
    {
        $existing = User::factory()->create([
            'email'   => 'existing@example.com',
            'name'    => 'Existing',
            'surname' => 'User',
        ]);

        $response = $this->postJson('/api/wp/newsletter-form', [
            'field_nombre'    => 'Updated',
            'field_apellidos' => 'Name',
            'field_email'     => 'existing@example.com',
        ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseCount('users', 1);
        $existing->refresh();
        $this->assertSame('Existing', $existing->name);
        $this->assertSame('User', $existing->surname);
    }

    /** @test */
    public function it_returns_500_when_exception_occurs(): void
    {
        // Sin empresa id=1, la creación de CrmContact falla por FK y el catch devuelve 500.
        Company::query()->where('id', 1)->delete();

        $response = $this->postJson('/api/wp/newsletter-form', [
            'field_email'     => 'newuser@example.com',
            'field_nombre'    => 'New',
            'field_apellidos' => 'User',
        ]);

        $response->assertStatus(500)
            ->assertJson([
                'success' => false,
                'error'   => 'An error occurred',
            ]);
    }
}
