<?php

namespace App\Console\Commands;

use App\Concerns\HasBusinessTypes;
use App\Concerns\HasContactTypes;
use App\Models\CostCenter;
use App\Models\CrmContact;
use App\Models\CrmContactExtraTmp;
use App\Models\Phone;
use App\Models\User;
use App\Models\UserCostCenter;
use App\Models\UserEmail;
use App\Support\ImportStringNormalizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

class PromoteCrmContactsExtra extends Command
{
    protected $signature = 'crm:promote-contacts-extra
                            {--company=1 : ID de la empresa}
                            {--chunk=500 : Tamaño de lote}
                            {--dry-run : Simular sin guardar}';

    protected $description = 'Promociona desde crm_contacts_extra_tmp a users, crm_contacts, phones, user_emails, cost_centers';

    /** type_key => lang key para HasContactTypes (para obtener etiqueta en español) */
    private static array $contactTypeLangKeys = [
        'cl'   => 'cliente',
        'clp'  => 'cliente_potencial',
        'colb' => 'colaborador',
        'conf' => 'conferencias',
        'inst' => 'institucional',
        'gbco' => 'gabinete_comunicacion',
        'mdco' => 'medio_comunicacion',
        'newl' => 'newsletter',
        'otrc' => 'contactos_otros',
        'patr' => 'patronato',
        'pr'   => 'proveedor',
        'arti' => 'artista',
    ];

    public function handle(): int
    {
        $companyId = (int) ($this->option('company') ?: 1);
        $chunkSize = (int) ($this->option('chunk') ?: 500);
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Promocionando contactos extra para company_id={$companyId}" . ($dryRun ? ' [DRY RUN]' : ''));

        $total = CrmContactExtraTmp::count();
        if ($total === 0) {
            $this->warn('No hay registros en crm_contacts_extra_tmp.');
            return Command::SUCCESS;
        }
        $this->info("Total registros a procesar: {$total}");

        $processed = 0;
        $createdUsers = 0;
        $updatedUsers = 0;
        $createdContacts = 0;
        $userCache = [];
        $contactTypeResolutionCache = $this->buildContactTypeResolutionMap();

        CrmContactExtraTmp::orderBy('id')->chunkById($chunkSize, function ($rows) use (
            $companyId,
            $dryRun,
            &$userCache,
            &$contactTypeResolutionCache,
            &$processed,
            &$createdUsers,
            &$updatedUsers,
            &$createdContacts
        ) {
            $closure = function () use (
                $rows,
                $companyId,
                &$userCache,
                &$contactTypeResolutionCache,
                &$processed,
                &$createdUsers,
                &$updatedUsers,
                &$createdContacts
            ) {
                foreach ($rows as $tmp) {
                    try {
                        [$user, $userCreated, $userUpdated] = $this->resolveUser($tmp, $userCache);
                        if (! $user) {
                            continue;
                        }
                        if ($userCreated) {
                            $createdUsers++;
                        }
                        if ($userUpdated) {
                            $updatedUsers++;
                        }

                        $contactType = $this->resolveContactType($tmp->contact_type, $contactTypeResolutionCache);
                        $businessType = $this->resolveBusinessType($tmp->business_type);

                        [$contact, $contactCreated] = $this->syncCrmContact($tmp, $companyId, $user, $contactType, $businessType);
                        if ($contactCreated) {
                            $createdContacts++;
                        }

                        $this->syncPhones($tmp, $user);
                        $this->syncUserEmails($tmp, $user);
                        $this->syncCostCenter($tmp, $companyId, $user, $contact);

                        $processed++;
                        if ($processed % 500 === 0) {
                            $this->info("Procesados {$processed}...");
                        }
                    } catch (\Throwable $e) {
                        $this->error("Error tmp id={$tmp->id}: {$e->getMessage()}");
                    }
                }
            };

            if ($dryRun) {
                DB::beginTransaction();
                try {
                    $closure();
                } finally {
                    DB::rollBack();
                }
            } else {
                DB::transaction($closure);
            }
        });

        $this->info("Proceso terminado. Procesados: {$processed}. Usuarios creados: {$createdUsers}, actualizados: {$updatedUsers}. Contactos creados: {$createdContacts}.");
        return Command::SUCCESS;
    }

    private function resolveUser(CrmContactExtraTmp $tmp, array &$cache): array
    {
        $email = trim((string) $tmp->email);
        if ($email === '') {
            return [null, false, false];
        }
        $cacheKey = 'email:' . $email;
        if (isset($cache[$cacheKey])) {
            return [$cache[$cacheKey], false, false];
        }

        $user = User::where('email', $email)->first();
        $created = false;
        $updated = false;

        if (! $user) {
            $user = new User();
            $user->name = $tmp->name ?? '';
            $user->surname = $tmp->surname;
            $user->email = $email;
            $user->nif = $tmp->nif;
            $user->password = bcrypt(Str::random(8));
            $user->isAdmin = false;
            $user->status = true;
            $user->save();
            try {
                $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));
            } catch (\Throwable $e) {
                // ignore
            }
            $created = true;
        } else {
            $changed = false;
            if (($tmp->name !== null && $tmp->name !== '') && ($user->name === null || $user->name === '')) {
                $user->name = $tmp->name;
                $changed = true;
            }
            if (($tmp->surname !== null && $tmp->surname !== '') && ($user->surname === null || $user->surname === '')) {
                $user->surname = $tmp->surname;
                $changed = true;
            }
            if ($changed) {
                $user->save();
                $updated = true;
            }
        }

        $cache[$cacheKey] = $user;
        return [$user, $created, $updated];
    }

    private function buildContactTypeResolutionMap(): array
    {
        $map = [];
        $localeEs = 'es';
        foreach (self::$contactTypeLangKeys as $typeKey => $langKey) {
            $label = __($langKey, [], $localeEs);
            $normalized = ImportStringNormalizer::normalize($label);
            if ($normalized !== '') {
                $map[$normalized] = $typeKey;
            }
        }
        $extraPath = lang_path('contact_types_extra_es.json');
        if (is_file($extraPath)) {
            $extra = json_decode(file_get_contents($extraPath), true);
            if (is_array($extra)) {
                foreach ($extra as $key => $label) {
                    $normalized = ImportStringNormalizer::normalize($label);
                    if ($normalized !== '' && strlen($key) <= 4) {
                        $map[$normalized] = $key;
                    }
                }
            }
        }
        return $map;
    }

    private function resolveContactType(?string $csvValue, array &$resolutionMap): ?string
    {
        if ($csvValue === null || trim($csvValue) === '') {
            return null;
        }
        $normalized = ImportStringNormalizer::normalize($csvValue);
        if ($normalized === '') {
            return null;
        }
        if (isset($resolutionMap[$normalized])) {
            return $resolutionMap[$normalized];
        }
        $newKey = $this->generateNewContactTypeKey($csvValue, $resolutionMap);
        if ($newKey === null) {
            return null;
        }
        $this->persistNewContactType($newKey, $csvValue);
        $resolutionMap[$normalized] = $newKey;
        return $newKey;
    }

    private function generateNewContactTypeKey(string $label, array $resolutionMap): ?string
    {
        $slug = Str::slug($label);
        $slug = preg_replace('/[^a-z0-9]/', '', $slug);
        $existingKeys = array_merge(array_keys(HasContactTypes::typesMap()), array_values($resolutionMap));
        $existingKeys = array_unique($existingKeys);
        if (strlen($slug) >= 4 && ! in_array(substr($slug, 0, 4), $existingKeys, true)) {
            return substr($slug, 0, 4);
        }
        for ($n = 1; $n <= 999; $n++) {
            $key = 'e' . str_pad((string) $n, 2, '0', STR_PAD_LEFT);
            $key = substr($key, 0, 4);
            if (! in_array($key, $existingKeys, true)) {
                return $key;
            }
        }
        return null;
    }

    private function persistNewContactType(string $key, string $label): void
    {
        $esPath = lang_path('contact_types_extra_es.json');
        $enPath = lang_path('contact_types_extra_en.json');
        $es = is_file($esPath) ? json_decode(file_get_contents($esPath), true) : [];
        $en = is_file($enPath) ? json_decode(file_get_contents($enPath), true) : [];
        $es = is_array($es) ? $es : [];
        $en = is_array($en) ? $en : [];
        $es[$key] = $label;
        $en[$key] = $label;
        file_put_contents($esPath, json_encode($es, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        file_put_contents($enPath, json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function resolveBusinessType(?string $csvValue): ?int
    {
        if ($csvValue === null || trim($csvValue) === '') {
            return null;
        }
        $normalized = ImportStringNormalizer::normalize($csvValue);
        foreach (HasBusinessTypes::typesMap() as $id => $literal) {
            if (ImportStringNormalizer::normalize($literal) === $normalized) {
                return $id;
            }
        }
        $this->getOutput()->writeln("<comment>business_type no reconocido: {$csvValue}. Se asigna null.</comment>", \Symfony\Component\Console\Output\OutputInterface::VERBOSITY_VERBOSE);
        return null;
    }

    private function syncCrmContact(CrmContactExtraTmp $tmp, int $companyId, User $user, ?string $contactType, ?int $businessType): array
    {
        $contact = CrmContact::where('company_id', $companyId)->where('user_id', $user->id)->first();
        $created = false;
        if (! $contact) {
            $contact = new CrmContact();
            $contact->company_id = $companyId;
            $contact->user_id = $user->id;
            $created = true;
        }
        $contact->position = $tmp->position;
        $contact->department = $tmp->department;
        $contact->cost_center = $tmp->cost_center;
        $contact->contact_type = $contactType;
        $contact->business_type = $businessType;
        $contact->status = 1;
        $contact->save();
        return [$contact, $created];
    }

    private function syncPhones(CrmContactExtraTmp $tmp, User $user): void
    {
        $util = PhoneNumberUtil::getInstance();
        $defaultRegion = 'ES';
        $numbers = array_filter([$tmp->phone1, $tmp->phone2, $tmp->phone3]);
        foreach ($numbers as $raw) {
            $raw = trim((string) $raw);
            if ($raw === '') {
                continue;
            }
            try {
                $parsed = $util->parse($raw, $defaultRegion);
                if (! $util->isValidNumber($parsed)) {
                    $this->getOutput()->writeln("<comment>Teléfono inválido (no insertado): {$raw}</comment>", \Symfony\Component\Console\Output\OutputInterface::VERBOSITY_VERBOSE);
                    continue;
                }
                $e164 = $util->format($parsed, PhoneNumberFormat::E164);
            } catch (\Throwable $e) {
                $this->getOutput()->writeln("<comment>Teléfono no parseable: {$raw}</comment>", \Symfony\Component\Console\Output\OutputInterface::VERBOSITY_VERBOSE);
                continue;
            }
            Phone::firstOrCreate(
                [
                    'phoneable_type' => User::class,
                    'phoneable_id'   => $user->id,
                    'e164'           => $e164,
                ],
                ['type' => 'mobile']
            );
        }
    }

    private function syncUserEmails(CrmContactExtraTmp $tmp, User $user): void
    {
        $emails = array_filter([$tmp->email2, $tmp->email3]);
        foreach ($emails as $email) {
            $email = trim((string) $email);
            if ($email === '') {
                continue;
            }
            $exists = UserEmail::where('user_id', $user->id)->where('email', $email)->exists();
            if (! $exists) {
                UserEmail::create([
                    'user_id' => $user->id,
                    'email'   => $email,
                ]);
            }
        }
    }

    private function syncCostCenter(CrmContactExtraTmp $tmp, int $companyId, User $user, CrmContact $contact): void
    {
        $literal = trim((string) $tmp->cost_center);
        if ($literal === '') {
            return;
        }
        $slug = Str::slug($literal);
        $costCenter = CostCenter::where('company_id', $companyId)->where('slug', $slug)->first();
        if (! $costCenter) {
            $costCenter = CostCenter::create([
                'company_id' => $companyId,
                'name'       => $literal,
                'slug'       => $slug,
                'status'     => 1,
            ]);
        }
        $exists = UserCostCenter::where('company_id', $companyId)
            ->where('user_id', $user->id)
            ->where('cost_center_id', $costCenter->id)
            ->exists();
        if (! $exists) {
            UserCostCenter::create([
                'company_id'     => $companyId,
                'user_id'        => $user->id,
                'cost_center_id' => $costCenter->id,
            ]);
        }
        if ($contact->cost_center !== $literal) {
            $contact->cost_center = $literal;
            $contact->save();
        }
    }
}
