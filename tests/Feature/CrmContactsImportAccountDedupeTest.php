<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CrmContactsImportAccountDedupeTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;

    private Company $companyA;

    private Company $companyB;

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

        $this->companyA = Company::factory()->create(['status' => 1]);
        $this->companyB = Company::factory()->create(['status' => 1]);
        $this->actor->companies()->attach([$this->companyA->id, $this->companyB->id], ['position' => 'test']);
    }

    private function makeAccount(Company $company, string $name, ?string $taxId = null): CrmAccount
    {
        $account = new CrmAccount();
        $account->company_id = $company->id;
        $account->name = $name;
        $account->normalized_name = Str::slug($name);
        $account->tax_id = $taxId;
        $account->owner_id = $this->actor->id;
        $account->created_by = $this->actor->id;
        $account->updated_by = $this->actor->id;
        $account->status = 1;
        $account->save();

        return $account;
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

        $path = tempnam(sys_get_temp_dir(), 'crm_import_').'.xlsx';
        (new Xlsx($spreadsheet))->save($path);

        return new UploadedFile($path, 'contactos-import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
    }

    private function postImport(UploadedFile $file, Company $company)
    {
        return $this->actingAs($this->actor)
            ->withSession(['currentCompany' => $company->id])
            ->post(route('crm-contacts.import.store'), ['file' => $file]);
    }

    /** @test */
    public function import_reuses_account_by_existing_tax_id(): void
    {
        $existing = $this->makeAccount($this->companyA, 'Empresa Alpha', 'B12345678');
        $before = CrmAccount::where('company_id', $this->companyA->id)->count();

        $file = $this->makeImportXlsx([[
            'name' => 'Ana',
            'surname' => 'Lopez',
            'user_email' => 'ana.tax@example.com',
            'company' => 'Empresa Alpha Otra Razon',
            'company_nif' => 'B12345678',
        ]]);

        $response = $this->postImport($file, $this->companyA);

        $response->assertRedirect(route('crm-contacts.import'));
        $this->assertSame($before, CrmAccount::where('company_id', $this->companyA->id)->count());

        $contact = CrmContact::where('company_id', $this->companyA->id)
            ->whereHas('user', fn ($q) => $q->where('email', 'ana.tax@example.com'))
            ->first();

        $this->assertNotNull($contact);
        $this->assertSame($existing->id, $contact->crm_account_id);
    }

    /** @test */
    public function import_reuses_account_by_normalized_name_when_nif_does_not_match(): void
    {
        $existing = $this->makeAccount($this->companyA, 'Viuda Vila Materiales', null);
        $before = CrmAccount::where('company_id', $this->companyA->id)->count();

        $file = $this->makeImportXlsx([[
            'name' => 'Luis',
            'surname' => 'Perez',
            'user_email' => 'luis.name@example.com',
            'company' => 'Viuda Vila Materiales',
            'company_nif' => '',
        ]]);

        $response = $this->postImport($file, $this->companyA);

        $response->assertRedirect(route('crm-contacts.import'));
        $this->assertSame($before, CrmAccount::where('company_id', $this->companyA->id)->count());

        $contact = CrmContact::where('company_id', $this->companyA->id)
            ->whereHas('user', fn ($q) => $q->where('email', 'luis.name@example.com'))
            ->first();

        $this->assertNotNull($contact);
        $this->assertSame($existing->id, $contact->crm_account_id);
    }

    /** @test */
    public function import_reuses_account_when_company_name_differs_but_slug_matches(): void
    {
        $existing = $this->makeAccount($this->companyA, 'Viuda Vila Materiales', null);
        $before = CrmAccount::where('company_id', $this->companyA->id)->count();

        // Mayúsculas y espacios distintos; Str::slug colapsa al mismo normalized_name
        $file = $this->makeImportXlsx([[
            'name' => 'Carmen',
            'surname' => 'Diaz',
            'user_email' => 'carmen.slug@example.com',
            'company' => '  VIUDA   VILA  MATERIALES ',
            'company_nif' => '',
        ]]);

        $response = $this->postImport($file, $this->companyA);

        $response->assertRedirect(route('crm-contacts.import'));
        $this->assertSame($before, CrmAccount::where('company_id', $this->companyA->id)->count());

        $contact = CrmContact::where('company_id', $this->companyA->id)
            ->whereHas('user', fn ($q) => $q->where('email', 'carmen.slug@example.com'))
            ->first();

        $this->assertNotNull($contact);
        $this->assertSame($existing->id, $contact->crm_account_id);
        $this->assertSame('viuda-vila-materiales', $existing->fresh()->normalized_name);
    }

    /** @test */
    public function import_creates_account_when_no_nif_or_name_match(): void
    {
        $before = CrmAccount::where('company_id', $this->companyA->id)->count();

        $file = $this->makeImportXlsx([[
            'name' => 'Marta',
            'surname' => 'Ruiz',
            'user_email' => 'marta.new@example.com',
            'company' => 'Nueva Empresa SA',
            'company_nif' => 'A99887766',
        ]]);

        $response = $this->postImport($file, $this->companyA);

        $response->assertRedirect(route('crm-contacts.import'));
        $this->assertSame($before + 1, CrmAccount::where('company_id', $this->companyA->id)->count());

        $created = CrmAccount::where('company_id', $this->companyA->id)
            ->where('tax_id', 'A99887766')
            ->first();
        $this->assertNotNull($created);
        $this->assertSame('nueva-empresa-sa', $created->normalized_name);

        $contact = CrmContact::where('company_id', $this->companyA->id)
            ->whereHas('user', fn ($q) => $q->where('email', 'marta.new@example.com'))
            ->first();
        $this->assertNotNull($contact);
        $this->assertSame($created->id, $contact->crm_account_id);
    }

    /** @test */
    public function import_prefers_tax_id_match_over_normalized_name_conflict(): void
    {
        $accountA = $this->makeAccount($this->companyA, 'Cuenta NIF', 'B11111111');
        $accountB = $this->makeAccount($this->companyA, 'Cuenta Nombre', null);
        $before = CrmAccount::where('company_id', $this->companyA->id)->count();

        $file = $this->makeImportXlsx([[
            'name' => 'Carlos',
            'surname' => 'Diaz',
            'user_email' => 'carlos.conflict@example.com',
            'company' => 'Cuenta Nombre',
            'company_nif' => 'B11111111',
        ]]);

        $response = $this->postImport($file, $this->companyA);

        $response->assertRedirect(route('crm-contacts.import'));
        $result = session('import_result');
        $this->assertIsArray($result);
        $this->assertSame(0, $result['total_failed'] ?? null);
        $this->assertSame($before, CrmAccount::where('company_id', $this->companyA->id)->count());

        $contact = CrmContact::where('company_id', $this->companyA->id)
            ->whereHas('user', fn ($q) => $q->where('email', 'carlos.conflict@example.com'))
            ->first();

        $this->assertNotNull($contact);
        $this->assertSame($accountA->id, $contact->crm_account_id);
        $this->assertNotSame($accountB->id, $contact->crm_account_id);
    }

    /** @test */
    public function import_does_not_reuse_accounts_from_another_company(): void
    {
        $otherByTax = $this->makeAccount($this->companyB, 'Empresa Externa', 'C55555555');
        $otherByName = $this->makeAccount($this->companyB, 'Nombre Compartido SL', null);
        $beforeA = CrmAccount::where('company_id', $this->companyA->id)->count();

        $file = $this->makeImportXlsx([
            [
                'name' => 'Eva',
                'surname' => 'Tax',
                'user_email' => 'eva.scope.tax@example.com',
                'company' => 'Empresa Local Tax',
                'company_nif' => 'C55555555',
            ],
            [
                'name' => 'Pablo',
                'surname' => 'Name',
                'user_email' => 'pablo.scope.name@example.com',
                'company' => 'Nombre Compartido SL',
                'company_nif' => '',
            ],
        ]);

        $response = $this->postImport($file, $this->companyA);

        $response->assertRedirect(route('crm-contacts.import'));
        $this->assertSame($beforeA + 2, CrmAccount::where('company_id', $this->companyA->id)->count());

        $contactTax = CrmContact::where('company_id', $this->companyA->id)
            ->whereHas('user', fn ($q) => $q->where('email', 'eva.scope.tax@example.com'))
            ->first();
        $contactName = CrmContact::where('company_id', $this->companyA->id)
            ->whereHas('user', fn ($q) => $q->where('email', 'pablo.scope.name@example.com'))
            ->first();

        $this->assertNotNull($contactTax);
        $this->assertNotNull($contactName);
        $this->assertNotSame($otherByTax->id, $contactTax->crm_account_id);
        $this->assertNotSame($otherByName->id, $contactName->crm_account_id);

        $localTax = CrmAccount::find($contactTax->crm_account_id);
        $localName = CrmAccount::find($contactName->crm_account_id);
        $this->assertSame($this->companyA->id, $localTax->company_id);
        $this->assertSame($this->companyA->id, $localName->company_id);
        $this->assertSame('C55555555', $localTax->tax_id);
        $this->assertSame('nombre-compartido-sl', $localName->normalized_name);
    }
}
