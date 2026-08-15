<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\Module;
use App\Models\Phone;
use App\Models\User;
use App\Models\UserCompany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CrmUsersDataStandardsTest extends TestCase
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

        $this->actor = User::factory()->create([
            'email' => 'actor@example.com',
        ]);
        $this->actor->assignRole('Super Admin');

        $this->companyA = Company::factory()->create(['status' => 1]);
        $this->companyB = Company::factory()->create(['status' => 1]);
        $this->actor->companies()->attach([$this->companyA->id, $this->companyB->id], ['position' => 'test']);
    }

    /** @test */
    public function user_mutators_persist_canonical_values(): void
    {
        $user = User::factory()->create([
            'name' => 'juan DE LA cruz',
            'surname' => 'mcdonald',
            'email' => '  Foo@Bar.COM ',
            'nif' => 'b-12345678',
            'birthday' => '15/01/1990',
        ]);

        $user->refresh();
        $this->assertSame('Juan de la Cruz', $user->name);
        $this->assertSame('McDonald', $user->surname);
        $this->assertSame('foo@bar.com', $user->email);
        $this->assertSame('B12345678', $user->nif);
        $this->assertSame('1990-01-15', $user->birthday?->format('Y-m-d') ?? (string) $user->getAttributes()['birthday']);
    }

    /** @test */
    public function import_persists_same_canonical_as_manual_user_fields(): void
    {
        $file = $this->makeImportXlsx([[
            'name' => 'ANA MARIA',
            'surname' => 'DE LOS SANTOS',
            'user_email' => '  Ana@Example.COM ',
            'user_nif' => 'a-11111111',
            'company' => '  ACME INDUSTRIAL S.A.  ',
            'company_nif' => 'b-22222222',
            'company_phone' => '600112233',
        ]]);

        $response = $this->actingAs($this->actor)
            ->withSession(['currentCompany' => $this->companyA->id])
            ->post(route('crm-contacts.import.store'), ['file' => $file]);

        $response->assertRedirect(route('crm-contacts.import'));

        $user = User::where('email', 'ana@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('Ana Maria', $user->name);
        $this->assertSame('De los Santos', $user->surname);
        $this->assertSame('A11111111', $user->nif);

        $account = CrmAccount::where('company_id', $this->companyA->id)->where('tax_id', 'B22222222')->first();
        $this->assertNotNull($account);
        $this->assertSame('ACME INDUSTRIAL S.A.', $account->name);
        $this->assertSame('+34600112233', $account->main_phone);
    }

    /** @test */
    public function command_dry_run_does_not_write_and_apply_is_idempotent(): void
    {
        $dirty = User::factory()->create([
            'name' => 'PEDRO',
            'surname' => 'LOPEZ',
            'email' => 'PEDRO@EXAMPLE.COM',
            'nif' => 'c-33333333',
        ]);
        // Bypass mutators for historic dirty email casing in DB if factory already normalized
        DB::table('users')->where('id', $dirty->id)->update([
            'name' => 'PEDRO',
            'surname' => 'LOPEZ',
            'email' => 'PEDRO@EXAMPLE.COM',
            'nif' => 'c-33333333',
        ]);

        UserCompany::create([
            'user_id' => $dirty->id,
            'company_id' => $this->companyA->id,
            'position' => 'test',
        ]);

        $this->artisan('data:normalize-crm-users', ['--company' => $this->companyA->id])
            ->assertSuccessful();

        $dirty->refresh();
        $attrs = (array) DB::table('users')->where('id', $dirty->id)->first();
        $this->assertSame('PEDRO@EXAMPLE.COM', $attrs['email']);

        $this->artisan('data:normalize-crm-users', [
            '--company' => $this->companyA->id,
            '--apply' => true,
        ])->assertSuccessful();

        $attrs = (array) DB::table('users')->where('id', $dirty->id)->first();
        $this->assertSame('pedro@example.com', $attrs['email']);
        $this->assertSame('Pedro', $attrs['name']);
        $this->assertSame('Lopez', $attrs['surname']);
        $this->assertSame('C33333333', $attrs['nif']);

        $this->artisan('data:normalize-crm-users', [
            '--company' => $this->companyA->id,
            '--apply' => true,
        ])->assertSuccessful();

        $attrs2 = (array) DB::table('users')->where('id', $dirty->id)->first();
        $this->assertSame($attrs, $attrs2);
    }

    /** @test */
    public function command_skips_email_collision_and_unparseable_phone(): void
    {
        $keeper = User::factory()->create(['email' => 'taken@example.com']);
        UserCompany::create(['user_id' => $keeper->id, 'company_id' => $this->companyA->id, 'position' => 't']);

        $victim = User::factory()->create(['email' => 'victim@example.com']);
        UserCompany::create(['user_id' => $victim->id, 'company_id' => $this->companyA->id, 'position' => 't']);
        DB::table('users')->where('id', $victim->id)->update(['email' => 'TAKEN@example.com']);

        $phone = new Phone();
        $phone->phoneable_type = User::class;
        $phone->phoneable_id = $victim->id;
        $phone->e164 = 'garbage-phone';
        $phone->type = 'mobile';
        $phone->is_primary = true;
        $phone->save();

        $this->artisan('data:normalize-crm-users', [
            '--company' => $this->companyA->id,
            '--apply' => true,
        ])->assertSuccessful();

        $this->assertSame('TAKEN@example.com', DB::table('users')->where('id', $victim->id)->value('email'));
        $this->assertSame('garbage-phone', DB::table('phones')->where('id', $phone->id)->value('e164'));
    }

    /** @test */
    public function command_company_scope_does_not_cross_and_skips_linked_master_name(): void
    {
        $userB = User::factory()->create();
        UserCompany::create(['user_id' => $userB->id, 'company_id' => $this->companyB->id, 'position' => 't']);
        DB::table('users')->where('id', $userB->id)->update(['name' => 'SOLO B']);

        $linkedCompany = Company::factory()->create(['status' => 1]);
        $account = new CrmAccount();
        $account->company_id = $this->companyA->id;
        $account->linked_company_id = $linkedCompany->id;
        $account->name = '  Linked Name  ';
        $account->normalized_name = 'wrong-slug';
        $account->owner_id = $this->actor->id;
        $account->created_by = $this->actor->id;
        $account->updated_by = $this->actor->id;
        $account->status = 1;
        $account->save();
        DB::table('crm_accounts')->where('id', $account->id)->update([
            'name' => '  Linked Name  ',
            'normalized_name' => 'wrong-slug',
        ]);

        $this->artisan('data:normalize-crm-users', [
            '--company' => $this->companyA->id,
            '--apply' => true,
        ])->assertSuccessful();

        $this->assertSame('SOLO B', DB::table('users')->where('id', $userB->id)->value('name'));
        $row = (array) DB::table('crm_accounts')->where('id', $account->id)->first();
        $this->assertSame('  Linked Name  ', $row['name']);
        $this->assertSame('linked-name', $row['normalized_name']);
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

        $path = tempnam(sys_get_temp_dir(), 'crm_ds_').'.xlsx';
        (new Xlsx($spreadsheet))->save($path);

        return new UploadedFile($path, 'contactos-import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
    }
}
