<?php

namespace Tests\Feature;

use App\Jobs\ProcessDocumentVariants;
use App\Models\Company;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DocumentGalleryTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $companyA;
    private Company $companyB;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->seedDocumentPermissionsAndRole();
        $this->user = User::factory()->create();
        $this->user->assignRole('Super Admin');
        $this->companyA = Company::factory()->create(['status' => 1]);
        $this->companyB = Company::factory()->create(['status' => 1]);
        $this->user->companies()->attach([$this->companyA->id, $this->companyB->id], ['position' => 'test']);
    }

    private function seedDocumentPermissionsAndRole(): void
    {
        $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        foreach (['documents.viewAny', 'documents.view', 'documents.create', 'documents.update', 'documents.destroy'] as $name) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
        $role->givePermissionTo(\Spatie\Permission\Models\Permission::all());
    }

    private function createDocument(array $overrides = []): Document
    {
        return Document::create(array_merge([
            'company_id' => $this->companyA->id,
            'uploaded_by_user_id' => $this->user->id,
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'disk' => 'local',
            'path' => 'companies/1/documents/originals/test.pdf',
            'original_name' => 'test.pdf',
            'stored_name' => 'test.pdf',
            'extension' => 'pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 0,
            'is_image' => false,
        ], $overrides));
    }

    /** @test */
    public function list_returns_only_current_company_documents(): void
    {
        $this->createDocument([
            'company_id' => $this->companyA->id,
            'uuid' => 'uuid-a-1',
            'original_name' => 'doc-a.pdf',
            'path' => 'companies/1/documents/originals/uuid-a-1.pdf',
        ]);
        $this->createDocument([
            'company_id' => $this->companyB->id,
            'uuid' => 'uuid-b-1',
            'original_name' => 'doc-b.pdf',
            'path' => 'companies/' . $this->companyB->id . '/documents/originals/uuid-b-1.pdf',
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->companyA->id])
            ->get(route('documents.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/DocumentGallery/Index')
            ->has('documents.data', 1)
            ->where('documents.data.0.original_name', 'doc-a.pdf')
        );
    }

    /** @test */
    public function cross_company_uuid_returns_403_for_show(): void
    {
        $docB = $this->createDocument([
            'company_id' => $this->companyB->id,
            'uuid' => 'uuid-b-show',
            'path' => 'companies/' . $this->companyB->id . '/documents/originals/uuid-b-show.pdf',
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->companyA->id])
            ->getJson(route('documents.show', $docB->uuid));

        $response->assertStatus(403);
    }

    /** @test */
    public function cross_company_uuid_returns_403_for_update(): void
    {
        $docB = $this->createDocument([
            'company_id' => $this->companyB->id,
            'uuid' => 'uuid-b-update',
            'path' => 'companies/' . $this->companyB->id . '/documents/originals/uuid-b-update.pdf',
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->companyA->id])
            ->patchJson(route('documents.update', $docB->uuid), [
                'title' => 'Updated',
                'alt_text' => null,
                'description' => null,
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function cross_company_uuid_returns_403_for_destroy(): void
    {
        $docB = $this->createDocument([
            'company_id' => $this->companyB->id,
            'uuid' => 'uuid-b-destroy',
            'path' => 'companies/' . $this->companyB->id . '/documents/originals/uuid-b-destroy.pdf',
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->companyA->id])
            ->deleteJson(route('documents.destroy', $docB->uuid));

        $response->assertStatus(403);
    }

    /** @test */
    public function upload_valid_image_creates_document_with_company_id(): void
    {
        $file = UploadedFile::fake()->image('test.jpg', 100, 100)->size(100);

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->companyA->id])
            ->post(route('documents.store'), [
                'files' => [$file],
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['created' => [['id', 'uuid', 'original_name', 'mime_type', 'is_image']]]);
        $this->assertDatabaseHas('documents', [
            'company_id' => $this->companyA->id,
            'is_image' => true,
        ]);
    }

    /** @test */
    public function invalid_file_type_rejected(): void
    {
        $file = UploadedFile::fake()->create('bad.exe', 100, 'application/octet-stream');

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->companyA->id])
            ->post(route('documents.store'), [
                'files' => [$file],
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors();
    }

    /** @test */
    public function process_document_variants_creates_variants_for_image(): void
    {
        $doc = $this->createDocument([
            'company_id' => $this->companyA->id,
            'uuid' => 'uuid-img-1',
            'is_image' => true,
            'extension' => 'jpg',
            'path' => 'companies/' . $this->companyA->id . '/documents/originals/uuid-img-1.jpg',
        ]);
        $fullPath = Storage::disk('local')->path($doc->path);
        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $img = imagecreatetruecolor(10, 10);
        imagejpeg($img, $fullPath, 90);
        imagedestroy($img);

        $job = new ProcessDocumentVariants($doc->id);
        $job->handle(app(\App\Services\DocumentService::class));

        $this->assertDatabaseHas('document_variants', [
            'document_id' => $doc->id,
            'variant' => 'thumb_sm',
        ]);
    }

    /** @test */
    public function process_document_variants_does_nothing_for_non_image(): void
    {
        $doc = $this->createDocument([
            'company_id' => $this->companyA->id,
            'uuid' => 'uuid-pdf-1',
            'is_image' => false,
            'extension' => 'pdf',
            'path' => 'companies/' . $this->companyA->id . '/documents/originals/uuid-pdf-1.pdf',
        ]);

        $job = new ProcessDocumentVariants($doc->id);
        $job->handle(app(\App\Services\DocumentService::class));

        $this->assertDatabaseMissing('document_variants', [
            'document_id' => $doc->id,
        ]);
    }
}
