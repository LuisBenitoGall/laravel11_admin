<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\CustomerProvider;
use App\Models\User;
use App\Support\CompanyContext;
use App\Support\DataStandards\EmailNormalizer;
use App\Support\DataStandards\NifNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Altas nuevas de identidad de entrega + espejo CRM.
 * Existente: usar EnsureSessionProviderCustomer (sin CRM).
 */
class CustodyIntakeIdentityCreate
{
    public function __construct(
        private CompanyContext $companyContext,
        private EnsureSessionProviderCustomer $ensure
    ) {}

    /**
     * @param  array{name?: ?string, email?: ?string, nif?: ?string}  $input
     * @return array{company: Company, account: CrmAccount, relation: CustomerProvider}
     */
    public function createCompany(array $input = []): array
    {
        $providerId = $this->providerId();
        $this->ensureFreeAccountExists();

        return DB::transaction(function () use ($providerId) {
            $payload = Request::create('/', 'POST', [
                'name' => 'Anónimo',
                'tradename' => 'Anónimo',
                'nif' => null,
                'is_ute' => false,
                'auto_link' => false,
            ]);

            $company = Company::saveCompany($payload, true);

            $accountRequest = Request::create('/', 'POST', [
                'name' => 'Anónimo',
                'tradename' => 'Anónimo',
            ]);
            $account = CrmAccount::saveAccount($accountRequest, $providerId, (int) $company->id);

            $relation = $this->ensure->ensureCompany((int) $company->id);

            return [
                'company' => $company,
                'account' => $account,
                'relation' => $relation,
            ];
        });
    }

    /**
     * @param  array{name?: ?string, email?: ?string, nif?: ?string}  $input
     * @return array{user: User, contact: CrmContact, relation: CustomerProvider}
     */
    public function createUser(array $input = []): array
    {
        $providerId = $this->providerId();
        $name = trim((string) ($input['name'] ?? ''));
        $email = EmailNormalizer::normalize($input['email'] ?? null);
        $nif = NifNormalizer::normalize($input['nif'] ?? null);

        return DB::transaction(function () use ($providerId, $name, $email, $nif) {
            $user = new User();
            $user->name = $name !== '' ? $name : 'Anónimo';
            $user->surname = '';
            $user->email = $email;
            $user->nif = $nif;
            $user->isAdmin = false;
            $user->status = true;
            $user->save();

            // Particular suelto: no crear user_companies

            $contact = CrmContact::firstOrCreate(
                [
                    'company_id' => $providerId,
                    'user_id' => $user->id,
                ],
                [
                    'owner_id' => Auth::id(),
                    'status' => 1,
                ]
            );

            $relation = $this->ensure->ensureUser((int) $user->id);

            return [
                'user' => $user,
                'contact' => $contact,
                'relation' => $relation,
            ];
        });
    }

    private function providerId(): int
    {
        $id = (int) $this->companyContext->id();
        if ($id <= 0) {
            throw new RuntimeException('No hay empresa en sesión.');
        }

        return $id;
    }

    private function ensureFreeAccountExists(): void
    {
        Account::firstOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
                'rate' => 0,
                'status' => 1,
            ]
        );
    }
}
