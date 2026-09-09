<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CrmContact;
use App\Models\Module;
use App\Models\Phone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CrmContactsImportIdentityGateTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Company $company;

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

        $this->actor = User::factory()->create();
        $this->actor->assignRole('Super Admin');
        $this->company = Company::factory()->create(['status' => 1]);
        $this->actor->companies()->attach($this->company->id, ['position' => 'test']);
    }

    /**
     * @param  array<int, array<string, string>>  $dataRows
     */
    private function makeImportXlsx(array $dataRows): UploadedFile
    {
        $headers = [
            'name', 'surname', 'user_email', 'user_nif', 'user_phone1', 'user_phone2',
            'position', 'department', 'observations', 'company', 'company_nif',
            'company_city', 'company_postal_code', 'company_street', 'company_phone',
            'company_email', 'account', 'contact_type', 'contact_subtype',
        ];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        foreach ($headers as $col => $header) {
            $sheet->setCellValue([$col + 1, 1], $header);
        }

        $rowNum = 2;
        foreach ($dataRows as $row) {
            foreach ($headers as $col => $header) {
                $sheet->setCellValue([$col + 1, $rowNum], $row[$header] ?? '');
            }
            $rowNum++;
        }

        $path = tempnam(sys_get_temp_dir(), 'crm_id_').'.xlsx';
        (new Xlsx($spreadsheet))->save($path);

        return new UploadedFile($path, 'contactos-import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
    }

    private function postImport(UploadedFile $file)
    {
        return $this->actingAs($this->actor)
            ->withSession(['currentCompany' => $this->company->id])
            ->post(route('crm-contacts.import.store'), ['file' => $file]);
    }

    /** @test */
    public function empty_name_with_user_email_creates_anonymous_user(): void
    {
        $usersBefore = User::count();

        $response = $this->postImport($this->makeImportXlsx([[
            'name' => '',
            'user_email' => 'anon.email@example.com',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertSame(0, $result['total_failed'] ?? null);
        $this->assertSame(1, $result['total_processed'] ?? null);
        $this->assertSame($usersBefore + 1, User::count());

        $user = User::where('email', 'anon.email@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('Anónimo', $user->name);
        $this->assertTrue(
            CrmContact::where('company_id', $this->company->id)->where('user_id', $user->id)->exists()
        );
    }

    /** @test */
    public function empty_name_with_valid_person_phone_creates_anonymous_and_syncs_phone(): void
    {
        $usersBefore = User::count();

        $response = $this->postImport($this->makeImportXlsx([[
            'name' => '',
            'user_email' => '',
            'user_phone1' => '600112233',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertSame(0, $result['total_failed'] ?? null);
        $this->assertSame(1, $result['total_processed'] ?? null);
        $this->assertSame($usersBefore + 1, User::count());

        $user = User::where('name', 'Anónimo')->whereNull('email')->latest('id')->first();
        $this->assertNotNull($user);
        $this->assertTrue(
            Phone::where('phoneable_type', User::class)
                ->where('phoneable_id', $user->id)
                ->where('e164', '+34600112233')
                ->exists()
        );
    }

    /** @test */
    public function empty_name_matching_existing_user_by_email_does_not_overwrite_name(): void
    {
        $existing = User::factory()->create([
            'name' => 'Nombre Existente',
            'email' => 'existing@example.com',
        ]);

        $response = $this->postImport($this->makeImportXlsx([[
            'name' => '',
            'user_email' => 'existing@example.com',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertSame(0, $result['total_failed'] ?? null);

        $existing->refresh();
        $this->assertSame('Nombre Existente', $existing->name);
        $this->assertTrue(
            CrmContact::where('company_id', $this->company->id)->where('user_id', $existing->id)->exists()
        );
    }

    /** @test */
    public function empty_name_email_and_unparseable_phone_fails_without_insert(): void
    {
        $usersBefore = User::count();
        $contactsBefore = CrmContact::count();

        $response = $this->postImport($this->makeImportXlsx([[
            'name' => '',
            'user_email' => '',
            'user_phone1' => 'not-a-phone',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertSame(1, $result['total_failed'] ?? null);
        $this->assertSame(0, $result['total_processed'] ?? null);
        $this->assertSame($usersBefore, User::count());
        $this->assertSame($contactsBefore, CrmContact::count());
        $this->assertStringContainsString(
            __('import_sin_identidad'),
            $result['failed_rows'][0]['reason'] ?? ''
        );
    }

    /** @test */
    public function company_email_or_phone_alone_does_not_open_gate(): void
    {
        $usersBefore = User::count();

        $response = $this->postImport($this->makeImportXlsx([[
            'name' => '',
            'user_email' => '',
            'company' => 'Solo Empresa SL',
            'company_email' => 'info@empresa.test',
            'company_phone' => '911223344',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertSame(1, $result['total_failed'] ?? null);
        $this->assertSame($usersBefore, User::count());
        $this->assertStringContainsString(
            __('import_sin_identidad'),
            $result['failed_rows'][0]['reason'] ?? ''
        );
    }

    /** @test */
    public function user_nif_alone_does_not_open_gate(): void
    {
        $usersBefore = User::count();

        $response = $this->postImport($this->makeImportXlsx([[
            'name' => '',
            'user_email' => '',
            'user_nif' => '12345678Z',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertSame(1, $result['total_failed'] ?? null);
        $this->assertSame($usersBefore, User::count());
        $this->assertStringContainsString(
            __('import_sin_identidad'),
            $result['failed_rows'][0]['reason'] ?? ''
        );
    }

    /** @test */
    public function three_empty_identity_fields_fail_with_new_reason_not_old_copy(): void
    {
        $response = $this->postImport($this->makeImportXlsx([[
            'name' => '',
            'user_email' => '',
            'user_phone1' => '',
            'user_phone2' => '',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $reason = $result['failed_rows'][0]['reason'] ?? '';
        $this->assertSame(__('import_sin_identidad'), $reason);
        $this->assertNotSame(__('import_sin_nombre'), $reason);
        $this->assertStringNotContainsString('Fila sin nombre.', $reason);
    }

    /** @test */
    public function informed_name_is_not_forced_to_anonymous(): void
    {
        $response = $this->postImport($this->makeImportXlsx([[
            'name' => 'Carla',
            'surname' => 'Ruiz',
            'user_email' => 'carla.ruiz@example.com',
        ]]));

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertSame(0, $result['total_failed'] ?? null);

        $user = User::where('email', 'carla.ruiz@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('Carla', $user->name);
        $this->assertNotSame('Anónimo', $user->name);
    }
}
