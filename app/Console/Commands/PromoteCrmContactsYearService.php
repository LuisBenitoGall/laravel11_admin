<?php

namespace App\Console\Commands;

use App\Models\CrmContact;
use App\Models\CrmContactYearServiceTmp;
use App\Models\User;
use App\Models\UserEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PromoteCrmContactsYearService extends Command
{
    protected $signature = 'crm:promote-contacts-year-service
                            {--chunk=500 : Tamaño de lote}
                            {--dry-run : Simular sin guardar}';

    protected $description = 'Promociona desde crm_contacts_year_service_tmp: actualiza crm_contacts.last_year_service buscando usuario por email o name+surname';

    public function handle(): int
    {
        $chunkSize = (int) ($this->option('chunk') ?: 500);
        $dryRun = (bool) $this->option('dry-run');

        $this->info('Promocionando last_year_service desde tmp' . ($dryRun ? ' [DRY RUN]' : ''));

        $total = CrmContactYearServiceTmp::count();
        if ($total === 0) {
            $this->warn('No hay registros en crm_contacts_year_service_tmp. Ejecuta antes: php artisan crm:import-contacts-year-service');
            return Command::SUCCESS;
        }
        $this->info("Total registros a procesar: {$total}");

        $processed = 0;
        $updated = 0;
        $notFound = 0;

        CrmContactYearServiceTmp::orderBy('id')->chunkById($chunkSize, function ($rows) use ($dryRun, &$processed, &$updated, &$notFound) {
            $closure = function () use ($rows, &$processed, &$updated, &$notFound) {
                foreach ($rows as $tmp) {
                    $userId = $this->resolveUserId($tmp);
                    if (! $userId) {
                        $notFound++;
                        if ($notFound <= 10) {
                            $this->warn("No encontrado: email=" . ($tmp->email ?? '') . " name={$tmp->name} {$tmp->surname}");
                        }
                        $processed++;
                        continue;
                    }

                    $year = $tmp->service_last_year;
                    if ($year === null) {
                        $processed++;
                        continue;
                    }

                    $affected = CrmContact::where('user_id', $userId)->update(['last_year_service' => $year]);
                    if ($affected > 0) {
                        $updated++;
                    }
                    $processed++;

                    if ($processed % 500 === 0) {
                        $this->info("Procesados {$processed}...");
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

        $this->info("Proceso terminado. Procesados: {$processed}. Contactos actualizados: {$updated}. Sin usuario encontrado: {$notFound}.");
        return Command::SUCCESS;
    }

    /**
     * Resuelve user_id: email (normalizado, case-insensitive), luego name+surname (varias estrategias).
     * Incluye usuarios soft-deleted para poder actualizar sus crm_contacts.
     */
    private function resolveUserId(CrmContactYearServiceTmp $tmp): ?int
    {
        $base = User::query()->withTrashed();

        $email = trim((string) $tmp->email);
        if ($email !== '') {
            $emailNorm = strtolower($email);
            $user = (clone $base)->whereRaw('LOWER(TRIM(email)) = ?', [$emailNorm])->first();
            if ($user) {
                return (int) $user->id;
            }
            // Buscar en user_emails (emails adicionales del usuario)
            $userEmail = UserEmail::whereRaw('LOWER(TRIM(email)) = ?', [$emailNorm])->first();
            if ($userEmail) {
                return (int) $userEmail->user_id;
            }
        }

        $name = trim((string) $tmp->name);
        $surname = trim((string) $tmp->surname);
        $fullNameCsv = preg_replace('/\s+/', ' ', trim($name . ' ' . $surname));
        if ($fullNameCsv === '') {
            return null;
        }

        // 1) Búsqueda exacta name + surname
        if ($name !== '' && $surname !== '') {
            $user = (clone $base)->where('name', $name)->where('surname', $surname)->first();
            if ($user) {
                return (int) $user->id;
            }
        }

        // 2) Si el CSV solo tiene "name" con todo el nombre, dividir: primera palabra = name, resto = surname
        if ($name !== '' && $surname === '' && str_contains($name, ' ')) {
            $parts = preg_split('/\s+/', $name, 2, PREG_SPLIT_NO_EMPTY);
            if (count($parts) === 2) {
                $user = (clone $base)->where('name', $parts[0])->where('surname', $parts[1])->first();
                if ($user) {
                    return (int) $user->id;
                }
            }
        }

        // 3) Nombre completo exacto (CONCAT en BD = fullNameCsv)
        $user = (clone $base)->whereRaw(
            "LOWER(TRIM(CONCAT(COALESCE(name,''), ' ', COALESCE(surname,'')))) = ?",
            [strtolower($fullNameCsv)]
        )->first();
        if ($user) {
            return (int) $user->id;
        }

        // 4) Nombre completo sin acentos (María vs Maria, etc.)
        $fullNameNorm = $this->normalizeForMatch($fullNameCsv);
        $user = (clone $base)->whereRaw(
            "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(CONCAT(COALESCE(name,''), ' ', COALESCE(surname,''))), 'á','a'), 'é','e'), 'í','i'), 'ó','o'), 'ú','u'), 'ñ','n'), 'ü','u')) = ?",
            [$fullNameNorm]
        )->first();
        if ($user) {
            return (int) $user->id;
        }

        return null;
    }

    private function normalizeForMatch(string $s): string
    {
        $s = strtolower(trim($s));
        $map = ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ñ' => 'n', 'ü' => 'u'];
        return strtr($s, $map);
    }
}
