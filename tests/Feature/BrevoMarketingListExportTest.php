<?php

namespace Tests\Feature;

use App\Jobs\SyncMarketingListToBrevo;
use App\Models\Company;
use App\Models\MarketingList;
use App\Models\MarketingListUser;
use App\Models\User;
use App\Services\Brevo\BrevoMarketingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Verifica que la exportación a Brevo:
 *  - Crea una lista nueva cuando no existe (brevo_list_id = null).
 *  - Actualiza (PUT) la lista cuando ya existe (brevo_list_id != null).
 *  - Re-crea la lista si fue eliminada en Brevo (404 en el PUT).
 *  - Sincroniza miembros correctamente (altas y bajas).
 */
class BrevoMarketingListExportTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['id' => 1]);
        $this->company = Company::factory()->create([
            'id'         => 1,
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // API key falsa para evitar el guard de BrevoMarketingService
        config(['brevo.api_key' => 'test-api-key-fake']);
    }

    // -------------------------------------------------------------------------
    // ensureRemoteList: crear lista nueva
    // -------------------------------------------------------------------------

    /** @test */
    public function creates_folder_and_list_in_brevo_when_none_exist(): void
    {
        $list = MarketingList::factory()->create(['company_id' => 1]);
        $this->assertNull($list->brevo_list_id);

        Http::fake([
            '*/contacts/folders'      => Http::response(['id' => 55], 201),
            '*/contacts/lists'        => Http::response(['id' => 99], 201),
        ]);

        $service = new BrevoMarketingService();
        $service->ensureRemoteList($list);

        $list->refresh();

        $this->assertEquals(55, $list->brevo_folder_id);
        $this->assertEquals(99, $list->brevo_list_id);
        $this->assertEquals('ok', $list->brevo_sync_status);
        $this->assertNull($list->brevo_sync_error);
    }

    /** @test */
    public function skips_folder_creation_when_folder_already_exists(): void
    {
        $list = MarketingList::factory()->create([
            'company_id'      => 1,
            'brevo_folder_id' => 55,
            'brevo_list_id'   => null,
        ]);

        Http::fake([
            '*/contacts/folders/55' => Http::response(['id' => 55, 'name' => 'ERP folder'], 200),
            '*/contacts/lists' => Http::response(['id' => 99], 201),
        ]);

        $service = new BrevoMarketingService();
        $service->ensureRemoteList($list);

        $list->refresh();

        $this->assertEquals(99, $list->brevo_list_id);
        Http::assertSentCount(2); // GET carpeta existente + POST lista
    }

    // -------------------------------------------------------------------------
    // ensureRemoteList: actualizar lista existente
    // -------------------------------------------------------------------------

    /** @test */
    public function updates_list_name_in_brevo_when_already_synced(): void
    {
        $list = MarketingList::factory()->syncedWithBrevo(99, 55)->create([
            'company_id' => 1,
            'name'       => 'Lista Actualizada',
        ]);

        Http::fake([
            '*/contacts/folders/55' => Http::response(['id' => 55, 'name' => 'ERP folder'], 200),
            '*/contacts/lists/99' => Http::response([], 200),
        ]);

        $service = new BrevoMarketingService();
        $service->ensureRemoteList($list);

        $list->refresh();

        $this->assertEquals('ok', $list->brevo_sync_status);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/contacts/lists/99')
                && $request->method() === 'PUT';
        });
    }

    /** @test */
    public function recreates_list_when_brevo_returns_404_on_update(): void
    {
        $list = MarketingList::factory()->syncedWithBrevo(99, 55)->create([
            'company_id' => 1,
        ]);

        Http::fake([
            '*/contacts/folders/55' => Http::response(['id' => 55, 'name' => 'ERP folder'], 200),
            // PUT 404: lista ya no existe en Brevo
            '*/contacts/lists/99'  => Http::response(['message' => 'List not found'], 404),
            // Recrea la lista
            '*/contacts/lists'     => Http::response(['id' => 200], 201),
        ]);

        $service = new BrevoMarketingService();
        $service->ensureRemoteList($list);

        $list->refresh();

        $this->assertEquals(200, $list->brevo_list_id);
        $this->assertEquals('ok', $list->brevo_sync_status);
    }

    /** @test */
    public function marks_error_status_when_update_fails_with_unexpected_code(): void
    {
        $list = MarketingList::factory()->syncedWithBrevo(99, 55)->create([
            'company_id' => 1,
        ]);

        Http::fake([
            '*/contacts/folders/55' => Http::response(['id' => 55, 'name' => 'ERP folder'], 200),
            '*/contacts/lists/99' => Http::response(['message' => 'Internal error'], 500),
        ]);

        $service = new BrevoMarketingService();
        $service->ensureRemoteList($list);

        $list->refresh();

        $this->assertEquals('error', $list->brevo_sync_status);
        $this->assertNotNull($list->brevo_sync_error);
    }

    /** @test */
    public function links_to_existing_list_when_creation_rejected_as_duplicate(): void
    {
        $list = MarketingList::factory()->create([
            'company_id'      => 1,
            'name'            => 'Mi Lista',
            'brevo_folder_id' => 55,
            'brevo_list_id'   => null,
        ]);

        $remoteName = "Mi Lista [ERP#1-{$list->id}]";

        Http::fake([
            '*/contacts/folders/55' => Http::response(['id' => 55, 'name' => 'ERP folder'], 200),
            // POST /contacts/lists rechazado (nombre duplicado)
            '*/contacts/lists' => Http::response(['message' => 'List already exists'], 400),
            // Búsqueda de la lista existente por nombre (GET con query params)
            '*/contacts/folders/55/lists*' => Http::response([
                'lists' => [['id' => 77, 'name' => $remoteName]],
            ], 200),
            // PUT para alinear nombre
            '*/contacts/lists/77' => Http::response([], 200),
        ]);

        $service = new BrevoMarketingService();
        $service->ensureRemoteList($list);

        $list->refresh();

        $this->assertEquals(77, $list->brevo_list_id);
        $this->assertEquals('ok', $list->brevo_sync_status);
    }

    /** @test */
    public function recreates_folder_when_brevo_returns_404_on_folder_validation(): void
    {
        $list = MarketingList::factory()->create([
            'company_id'      => 1,
            'brevo_folder_id' => 33,
            'brevo_list_id'   => null,
        ]);

        Http::fake(function ($request) {
            $url = $request->url();
            $path = parse_url($url, PHP_URL_PATH) ?? '';

            if ($request->method() === 'GET' && str_contains($path, '/contacts/folders/33')) {
                return Http::response(['code' => 'document_not_found', 'message' => 'Folder ID does not exist'], 404);
            }

            if ($request->method() === 'POST' && preg_match('#/contacts/folders$#', $path)) {
                return Http::response(['id' => 88], 201);
            }

            if ($request->method() === 'POST' && str_contains($path, '/contacts/lists')) {
                return Http::response(['id' => 99], 201);
            }

            return Http::response([], 404);
        });

        $service = new BrevoMarketingService();
        $service->ensureRemoteList($list);

        $list->refresh();

        $this->assertEquals(88, $list->brevo_folder_id);
        $this->assertEquals(99, $list->brevo_list_id);
        $this->assertEquals('ok', $list->brevo_sync_status);
    }

    // -------------------------------------------------------------------------
    // syncListMembers: altas y bajas
    // -------------------------------------------------------------------------

    /** @test */
    public function syncs_members_to_brevo_list(): void
    {
        $list = MarketingList::factory()->syncedWithBrevo(99, 55)->create([
            'company_id' => 1,
        ]);

        $member = User::factory()->create(['email' => 'test@example.com', 'status' => 1]);
        MarketingListUser::create([
            'marketing_list_id' => $list->id,
            'user_id'           => $member->id,
            'status'            => 1,
            'created_by'        => 1,
            'updated_by'        => 1,
        ]);

        Http::fake([
            // Lista actual en Brevo: vacía
            '*/contacts/lists/99/contacts' => Http::response(['contacts' => []], 200),
            // Upsert del miembro
            '*/contacts' => Http::response(['id' => 1], 201),
        ]);

        $service = new BrevoMarketingService();
        $service->syncListMembers($list);

        $list->refresh();

        $this->assertEquals('ok', $list->brevo_sync_status);
        $this->assertNotNull($list->brevo_synced_at);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/contacts')
                && $request->method() === 'POST'
                && str_contains($request->body(), 'test@example.com');
        });
    }

    /** @test */
    public function removes_contacts_from_brevo_that_are_not_in_crm(): void
    {
        $list = MarketingList::factory()->syncedWithBrevo(99, 55)->create([
            'company_id' => 1,
        ]);

        Http::fake([
            // Remove (más específico, debe ir antes del wildcard)
            '*/contacts/lists/99/contacts/remove' => Http::response([], 200),
            // Brevo tiene un contacto que ya no está en CRM (GET con query params)
            '*/contacts/lists/99/contacts*' => Http::response([
                'contacts' => [['email' => 'old@example.com']],
            ], 200),
        ]);

        $service = new BrevoMarketingService();
        $service->syncListMembers($list);

        $list->refresh();

        $this->assertEquals('ok', $list->brevo_sync_status);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/contacts/remove')
                && str_contains($request->body(), 'old@example.com');
        });
    }

    // -------------------------------------------------------------------------
    // Controlador: dispatch del job
    // -------------------------------------------------------------------------

    /** @test */
    public function export_route_dispatches_sync_job(): void
    {
        Queue::fake();

        $list = MarketingList::factory()->create(['company_id' => 1]);

        $this->actingAs($this->user)
            ->withSession(['currentCompany' => 1])
            ->post(route('marketing-lists.export-brevo', $list->id))
            ->assertRedirect()
            ->assertSessionHas('msg', __('lista_export_brevo_en_proceso'));

        Queue::assertPushed(SyncMarketingListToBrevo::class, function ($job) use ($list) {
            return $job->listId === $list->id;
        });

        $list->refresh();
        $this->assertEquals('pending', $list->brevo_sync_status);
    }

    /** @test */
    public function export_route_returns_403_for_wrong_company(): void
    {
        $otherCompany = Company::factory()->create(['created_by' => 1, 'updated_by' => 1]);
        $list = MarketingList::factory()->create(['company_id' => $otherCompany->id]);

        $this->actingAs($this->user)
            ->withSession(['currentCompany' => 1])
            ->post(route('marketing-lists.export-brevo', $list->id))
            ->assertForbidden();
    }
}
