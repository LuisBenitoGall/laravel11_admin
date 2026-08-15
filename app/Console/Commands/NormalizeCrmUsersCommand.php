<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\Phone;
use App\Models\User;
use App\Models\UserEmail;
use App\Support\DataStandards\AccountNameNormalizer;
use App\Support\DataStandards\DateNormalizer;
use App\Support\DataStandards\EmailNormalizer;
use App\Support\DataStandards\NifNormalizer;
use App\Support\DataStandards\PersonNameNormalizer;
use App\Support\DataStandards\PhoneNormalizer;
use App\Support\DataStandards\SlugNormalizer;
use App\Support\DataStandards\TextCleanupNormalizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class NormalizeCrmUsersCommand extends Command
{
    protected $signature = 'data:normalize-crm-users
                            {--apply : Persistir cambios (sin este flag es dry-run)}
                            {--company= : Acotar a un company_id}
                            {--chunk=200 : Tamaño de chunk}';

    protected $description = 'Normaliza users, crm_accounts, phones y user_emails al canónico DataStandards (dry-run por defecto)';

    /** @var list<array<string, mixed>> */
    private array $reportRows = [];

    private int $updatedCount = 0;

    private int $wouldUpdateCount = 0;

    private int $skipCount = 0;

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $chunk = max(1, (int) $this->option('chunk'));
        $companyOpt = $this->option('company');
        $companyId = $companyOpt !== null && $companyOpt !== '' ? (int) $companyOpt : null;

        $companyIds = $this->resolveCompanyIds($companyId);
        if ($companyIds === []) {
            $this->warn('No hay empresas en el universo.');

            return self::SUCCESS;
        }

        $userIds = $this->resolveUserIds($companyIds);
        $this->info(($apply ? 'APPLY' : 'DRY-RUN').' | companies='.count($companyIds).' | users='.count($userIds).' | chunk='.$chunk);

        foreach (array_chunk($userIds, $chunk) as $chunkIds) {
            $users = User::query()->whereIn('id', $chunkIds)->get();
            foreach ($users as $user) {
                $this->normalizeUser($user, $apply);
            }
            $phones = Phone::query()
                ->where('phoneable_type', User::class)
                ->whereIn('phoneable_id', $chunkIds)
                ->get();
            foreach ($phones as $phone) {
                $this->normalizePhone($phone, $apply);
            }
            $emails = UserEmail::query()->whereIn('user_id', $chunkIds)->get();
            foreach ($emails as $email) {
                $this->normalizeUserEmail($email, $apply);
            }
        }

        CrmAccount::query()
            ->whereIn('company_id', $companyIds)
            ->orderBy('id')
            ->chunkById($chunk, function ($accounts) use ($apply) {
                foreach ($accounts as $account) {
                    $this->normalizeAccount($account, $apply);
                }
            });

        $path = $this->writeReport($apply);
        $this->info("would_update={$this->wouldUpdateCount} updated={$this->updatedCount} skips={$this->skipCount}");
        $this->info('Informe: '.$path);

        return self::SUCCESS;
    }

    /**
     * @return list<int>
     */
    private function resolveCompanyIds(?int $companyId): array
    {
        if ($companyId !== null && $companyId > 0) {
            return Company::query()->where('id', $companyId)->pluck('id')->map(fn ($id) => (int) $id)->all();
        }

        return Company::query()->where('status', 1)->orderBy('id')->pluck('id')->map(fn ($id) => (int) $id)->all();
    }

    /**
     * @param  list<int>  $companyIds
     * @return list<int>
     */
    private function resolveUserIds(array $companyIds): array
    {
        $fromContacts = CrmContact::query()
            ->whereIn('company_id', $companyIds)
            ->whereNotNull('user_id')
            ->pluck('user_id');

        $fromPivot = DB::table('user_companies')
            ->whereIn('company_id', $companyIds)
            ->pluck('user_id');

        return $fromContacts->merge($fromPivot)->unique()->sort()->values()->map(fn ($id) => (int) $id)->all();
    }

    private function normalizeUser(User $user, bool $apply): void
    {
        $this->applyField($user, 'email', $user->getAttributes()['email'] ?? null, EmailNormalizer::normalize($user->getAttributes()['email'] ?? null), $apply, function (string $canonical) use ($user) {
            return User::query()->where('email', $canonical)->where('id', '!=', $user->id)->exists();
        });

        $this->applyField($user, 'nif', $user->getAttributes()['nif'] ?? null, NifNormalizer::normalize($user->getAttributes()['nif'] ?? null), $apply, function (string $canonical) use ($user) {
            return User::query()->where('nif', $canonical)->where('id', '!=', $user->id)->exists();
        });

        $rawName = $user->getAttributes()['name'] ?? null;
        $this->applyField($user, 'name', $rawName, PersonNameNormalizer::normalize(is_string($rawName) ? $rawName : null), $apply);

        $rawSurname = $user->getAttributes()['surname'] ?? null;
        $this->applyField($user, 'surname', $rawSurname, PersonNameNormalizer::normalize(is_string($rawSurname) ? $rawSurname : null), $apply);

        $rawBirthday = $user->getAttributes()['birthday'] ?? null;
        $birthdayStr = $rawBirthday !== null ? (string) $rawBirthday : null;
        $canonicalBirthday = DateNormalizer::normalize($birthdayStr);
        if ($birthdayStr !== null && TextCleanupNormalizer::normalize($birthdayStr) !== '' && $canonicalBirthday === null) {
            $this->record('users', $user->id, 'birthday', $birthdayStr, null, 'skip_unparseable');
        } else {
            $this->applyField($user, 'birthday', $birthdayStr, $canonicalBirthday, $apply);
        }

        if ($apply && $user->isDirty()) {
            $user->save();
        }
    }

    private function normalizePhone(Phone $phone, bool $apply): void
    {
        $before = $phone->getAttributes()['e164'] ?? null;
        $canonical = PhoneNormalizer::toE164OrNull(is_string($before) ? $before : null);
        if ($canonical === null) {
            if (is_string($before) && PhoneNormalizer::trimAllWhitespace($before) !== '') {
                $this->record('phones', $phone->id, 'e164', $before, null, 'skip_unparseable');
            }

            return;
        }

        if ((string) $before === (string) $canonical) {
            $this->record('phones', $phone->id, 'e164', $before, $canonical, 'unchanged');

            return;
        }

        // UNIQUE en MySQL incluye soft-deleted; el scope por defecto los oculta.
        $collision = Phone::withTrashed()
            ->where('phoneable_type', $phone->phoneable_type)
            ->where('phoneable_id', $phone->phoneable_id)
            ->where('e164', $canonical)
            ->where('id', '!=', $phone->id)
            ->exists();

        if ($collision) {
            $this->record('phones', $phone->id, 'e164', $before, $canonical, 'skip_collision');

            return;
        }

        if ($apply) {
            try {
                $phone->e164 = $canonical;
                $phone->save();
                $this->record('phones', $phone->id, 'e164', $before, $canonical, 'updated');
            } catch (\Illuminate\Database\QueryException $e) {
                if ((string) $e->getCode() === '23000' || str_contains($e->getMessage(), 'phones_owner_e164_unique')) {
                    $this->record('phones', $phone->id, 'e164', $before, $canonical, 'skip_collision');

                    return;
                }
                throw $e;
            }
        } else {
            $this->record('phones', $phone->id, 'e164', $before, $canonical, 'would_update');
        }
    }

    private function normalizeUserEmail(UserEmail $email, bool $apply): void
    {
        $before = $email->getAttributes()['email'] ?? null;
        $canonical = EmailNormalizer::normalize(is_string($before) ? $before : null);
        $this->applyField($email, 'email', $before, $canonical, $apply);
        if ($apply && $email->isDirty()) {
            $email->save();
        }
    }

    private function normalizeAccount(CrmAccount $account, bool $apply): void
    {
        $linked = $account->isLinkedToMaster();
        $attrs = $account->getAttributes();

        if ($linked) {
            foreach (['name', 'tradename', 'nif', 'tax_id'] as $field) {
                $before = $attrs[$field] ?? null;
                if ($field === 'name' || $field === 'tradename') {
                    $canonical = AccountNameNormalizer::normalize(is_string($before) ? $before : null);
                    $canonical = $canonical === '' ? null : $canonical;
                    if ($field === 'tradename' && ($before === null || $before === '')) {
                        continue;
                    }
                    if ($field === 'name') {
                        $canonicalName = AccountNameNormalizer::normalize(is_string($before) ? $before : '');
                        if ((string) $before !== (string) $canonicalName) {
                            $this->record('crm_accounts', $account->id, $field, $before, $canonicalName, 'skip_linked_master');
                        }
                    } elseif ((string) $before !== (string) ($canonical ?? '')) {
                        $this->record('crm_accounts', $account->id, $field, $before, $canonical, 'skip_linked_master');
                    }
                } else {
                    $canonical = NifNormalizer::normalize(is_string($before) ? $before : null);
                    if ((string) $before !== (string) ($canonical ?? '') && ! ($before === null && $canonical === null)) {
                        $this->record('crm_accounts', $account->id, $field, $before, $canonical, 'skip_linked_master');
                    }
                }
            }
        } else {
            $rawName = $attrs['name'] ?? null;
            $canonicalName = AccountNameNormalizer::normalize(is_string($rawName) ? $rawName : '');
            $this->applyField($account, 'name', $rawName, $canonicalName, $apply);

            $rawTrade = $attrs['tradename'] ?? null;
            $canonicalTrade = AccountNameNormalizer::normalize(is_string($rawTrade) ? $rawTrade : null);
            $canonicalTrade = $canonicalTrade === '' ? null : $canonicalTrade;
            $this->applyField($account, 'tradename', $rawTrade, $canonicalTrade, $apply);

            $this->applyField($account, 'tax_id', $attrs['tax_id'] ?? null, NifNormalizer::normalize($attrs['tax_id'] ?? null), $apply);
            $this->applyField($account, 'nif', $attrs['nif'] ?? null, NifNormalizer::normalize($attrs['nif'] ?? null), $apply);
        }

        $this->applyField($account, 'main_email', $attrs['main_email'] ?? null, EmailNormalizer::normalize($attrs['main_email'] ?? null), $apply);

        $rawPhone = $attrs['main_phone'] ?? null;
        $canonicalPhone = PhoneNormalizer::toE164OrNull(is_string($rawPhone) ? $rawPhone : null);
        if (is_string($rawPhone) && PhoneNormalizer::trimAllWhitespace($rawPhone) !== '' && $canonicalPhone === null) {
            $this->record('crm_accounts', $account->id, 'main_phone', $rawPhone, null, 'skip_unparseable');
        } else {
            $this->applyField($account, 'main_phone', $rawPhone, $canonicalPhone, $apply);
        }

        $this->applyField($account, 'website', $attrs['website'] ?? null, $this->nullableText($attrs['website'] ?? null), $apply);

        foreach ([
            'billing_street', 'billing_city', 'billing_state', 'billing_postal_code',
            'shipping_street', 'shipping_city', 'shipping_state', 'shipping_postal_code',
        ] as $field) {
            $this->applyField($account, $field, $attrs[$field] ?? null, $this->nullableText($attrs[$field] ?? null), $apply);
        }

        foreach (['billing_country_code', 'shipping_country_code'] as $field) {
            $before = $attrs[$field] ?? null;
            $canonical = $this->nullableText($before);
            $canonical = $canonical !== null ? mb_strtoupper($canonical, 'UTF-8') : null;
            $this->applyField($account, $field, $before, $canonical, $apply);
        }

        // normalized_name desde name persistido (aunque name esté locked)
        $nameForSlug = (string) ($account->getAttributes()['name'] ?? $attrs['name'] ?? '');
        $slug = SlugNormalizer::normalize($nameForSlug);
        $beforeSlug = $attrs['normalized_name'] ?? null;
        $currentSlug = $account->getAttributes()['normalized_name'] ?? $beforeSlug;
        if ($slug !== '' && (string) $currentSlug !== $slug) {
            if ($apply) {
                $account->normalized_name = $slug;
                $this->record('crm_accounts', $account->id, 'normalized_name', $beforeSlug, $slug, 'updated');
            } else {
                $this->record('crm_accounts', $account->id, 'normalized_name', $beforeSlug, $slug, 'would_update');
            }
        }

        if ($apply && $account->isDirty()) {
            $account->save();
        }
    }

    private function nullableText(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        if (! is_string($value)) {
            return null;
        }
        $v = TextCleanupNormalizer::normalize($value);

        return $v === '' ? null : $v;
    }

    /**
     * @param  callable(string): bool|null  $collisionCheck
     */
    private function applyField(object $model, string $field, mixed $before, mixed $canonical, bool $apply, ?callable $collisionCheck = null): void
    {
        $beforeStr = $before === null ? null : (string) $before;
        $afterStr = $canonical === null ? null : (string) $canonical;

        if ($beforeStr === $afterStr) {
            $this->record($model->getTable(), $model->id, $field, $before, $canonical, 'unchanged');

            return;
        }

        if ($canonical !== null && $collisionCheck !== null && $collisionCheck((string) $canonical)) {
            $this->record($model->getTable(), $model->id, $field, $before, $canonical, 'skip_collision');

            return;
        }

        if ($apply) {
            $model->{$field} = $canonical;
            $this->record($model->getTable(), $model->id, $field, $before, $canonical, 'updated');
        } else {
            $this->record($model->getTable(), $model->id, $field, $before, $canonical, 'would_update');
        }
    }

    private function record(string $entity, int $id, string $field, mixed $before, mixed $after, string $action): void
    {
        if ($action === 'unchanged') {
            return;
        }
        if (in_array($action, ['skip_collision', 'skip_unparseable', 'skip_linked_master'], true)) {
            $this->skipCount++;
        } elseif ($action === 'updated') {
            $this->updatedCount++;
        } elseif ($action === 'would_update') {
            $this->wouldUpdateCount++;
        }

        $this->reportRows[] = [
            'entity' => $entity,
            'id' => $id,
            'field' => $field,
            'before' => $before,
            'after' => $after,
            'action' => $action,
        ];
        $this->line(sprintf('[%s] %s#%d.%s %s → %s (%s)', $action, $entity, $id, $field, json_encode($before), json_encode($after), $action));
    }

    private function writeReport(bool $apply): string
    {
        $timestamp = now()->format('Ymd-His');
        $path = storage_path('logs/data-normalize-crm-users-'.$timestamp.'.json');
        $payload = [
            'mode' => $apply ? 'apply' : 'dry-run',
            'generated_at' => now()->toIso8601String(),
            'counts' => [
                'would_update' => $this->wouldUpdateCount,
                'updated' => $this->updatedCount,
                'skips' => $this->skipCount,
                'rows' => count($this->reportRows),
            ],
            'rows' => $this->reportRows,
        ];
        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0775, true);
        }
        file_put_contents($path, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $path;
    }
}
