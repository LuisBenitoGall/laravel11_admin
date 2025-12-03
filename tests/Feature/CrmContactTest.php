<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

//Models:
use App\Models\User;
use App\Models\CrmContact;

class CrmContactTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_lists_contacts_even_without_email()
    {
        // 1) Crear usuario sin email
        $userWithoutEmail = User::factory()->create([
            'name' => 'Jose',
            'surname' => 'Munoz',
            'email' => null,
        ]);

        // 2) Asociar contacto CRM a la empresa en sesión
        CrmContact::factory()->create([
            'user_id' => $userWithoutEmail->id,
            'company_id' => 1, // simula empresa en sesión
            'contact_type' => 'clp',
        ]);

        // 3) Ejecutar la ruta que usa dataQuery
        $response = $this->get('/crm/contacts?company_id=1');

        // 4) Validar que aparece en el listado
        $response->assertStatus(200);
        $response->assertSee('Jose');
        $response->assertSee('Munoz');
    }

    /** @test */
    public function it_filters_contacts_accent_insensitive()
    {
        $userWithAccent = User::factory()->create([
            'name' => 'José',
            'surname' => 'Álvarez',
            'email' => null,
        ]);

        CrmContact::factory()->create([
            'user_id' => $userWithAccent->id,
            'company_id' => 1,
        ]);

        // Buscar sin acento
        $response = $this->get('/crm/contacts?company_id=1&name=Jose');

        $response->assertStatus(200);
        $response->assertSee('José');
    }

}
