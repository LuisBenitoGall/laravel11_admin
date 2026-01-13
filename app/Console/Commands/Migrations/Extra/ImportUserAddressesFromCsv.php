<?php

namespace App\Console\Commands\Migrations\Extra;

use App\Models\User;
use App\Models\UserAddress;
use App\Models\Town;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

//Ejecutar: php artisan migrations:extra-import-user-addresses --path=migrations/extra/user_addresses_contacts.csv
//Test: php artisan migrations:extra-import-user-addresses --dry-run

class ImportUserAddressesFromCsv extends Command
{
    protected $signature = 'migrations:extra-import-user-addresses
        {--path= : Ruta absoluta o relativa (desde storage/app) al CSV}
        {--dry-run : No inserta, solo simula}
    ';

    protected $description = 'Importa direcciones postales (user_addresses) desde CSV para usuarios que no tengan direcciones.';

    public function handle(): int
    {
        $pathOption = $this->option('path');
        $dryRun = (bool) $this->option('dry-run');

        // Ruta por defecto
        $defaultRelative = 'migrations/extra/user_addresses_contacts.csv';

        $csvPath = $pathOption
            ? $this->resolveCsvPath($pathOption)
            : storage_path('app/' . $defaultRelative);

        if (!is_file($csvPath)) {
            $this->error("CSV no encontrado en: {$csvPath}");
            return self::FAILURE;
        }

        $this->info('CSV: ' . $csvPath);
        if ($dryRun) {
            $this->warn('DRY RUN activo: no se insertará nada.');
        }

        $handle = fopen($csvPath, 'r');
        if (!$handle) {
            $this->error('No se pudo abrir el CSV.');
            return self::FAILURE;
        }

        $firstLine = fgets($handle);
        if ($firstLine === false) {
            fclose($handle);
            $this->error('CSV vacío o sin cabecera.');
            return self::FAILURE;
        }

        // Detecta delimitador por frecuencia
        $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

        // Vuelve al inicio para que fgetcsv lea la cabecera correctamente
        rewind($handle);

        $header = fgetcsv($handle, 0, $delimiter);
        if (!$header) {
            fclose($handle);
            $this->error('No se pudo leer la cabecera del CSV.');
            return self::FAILURE;
        }

        $header = array_map(fn ($h) => trim((string) $h), $header);
        $idx = $this->buildIndexMap($header);

        $required = ['email', 'address1', 'address2', 'cp', 'city'];
        foreach ($required as $col) {
            if (!array_key_exists($col, $idx)) {
                fclose($handle);
                $this->error("Falta columna requerida en CSV: {$col}");
                return self::FAILURE;
            }
        }

        $missingTownEmails = [];
        $emailToUserIdCache = [];

        $stats = [
            'rows_total' => 0,
            'skipped_no_email' => 0,
            'skipped_user_not_found' => 0,
            'skipped_has_address' => 0,
            'skipped_no_address1' => 0,
            'inserted' => 0,
            'town_missing' => 0,
        ];

        // Para no reventar la RAM: procesar fila a fila
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $stats['rows_total']++;

            $email = $this->get($row, $idx, 'email');
            if ($email === '') {
                $stats['skipped_no_email']++;
                continue;
            }

            $emailKey = mb_strtolower($email);

            $userId = $emailToUserIdCache[$emailKey] ?? null;
            if ($userId === null) {
                $userId = User::query()
                    ->where('email', $email)
                    ->value('id');

                // Cachea incluso null para no repetir queries inútiles
                $emailToUserIdCache[$emailKey] = $userId ?: 0;
            }

            if (!$userId) {
                $stats['skipped_user_not_found']++;
                continue;
            }

            $query = UserAddress::query()->where('user_id', $userId);

            // Si el modelo tiene SoftDeletes, incluye borradas para decidir el skip
            if (in_array('Illuminate\\Database\\Eloquent\\SoftDeletes', class_uses(UserAddress::class))) {
                $query->withTrashed();
            }

            if ($query->exists()) {
                $stats['skipped_has_address']++;
                continue;
            }


            $address1 = $this->get($row, $idx, 'address1');
            if ($address1 === '') {
                // Esto no lo pedías explícito, pero si address es NOT NULL en BD, mejor no romper.
                $address1 = '-';
            }

            $address2 = $this->get($row, $idx, 'address2');
            $cp = $this->get($row, $idx, 'cp');
            $city = $this->get($row, $idx, 'city');

            $townId = null;
            if ($city !== '') {
                $townId = Town::query()->where('name', $city)->value('id');

                if (!$townId) {
                    $stats['town_missing']++;
                    $missingTownEmails[$emailKey] = $email; // unique
                }
            }

            if (!$dryRun) {
                UserAddress::query()->create([
                    'user_id' => $userId,
                    'label' => null,
                    'address' => $address1,
                    'address_extra' => $address2 !== '' ? $address2 : null,
                    'cp' => $cp !== '' ? $cp : null,
                    'town_id' => $townId,
                    'observations' => null,
                    'is_main' => true,
                ]);
            }

            $stats['inserted']++;
        }

        fclose($handle);

        $missingTownList = array_values($missingTownEmails);

        $this->newLine();
        $this->info('Resumen importación:');
        foreach ($stats as $k => $v) {
            $this->line(str_pad($k, 22) . ': ' . $v);
        }

        $this->newLine();
        $this->info('Emails con city sin towns.id (únicos): ' . count($missingTownList));
        if (count($missingTownList)) {
            foreach ($missingTownList as $mail) {
                $this->line(' - ' . $mail);
            }
        }

        // Opcional: guardar reporte en storage
        $reportPath = storage_path('app/migrations/extra/report_user_addresses_' . now()->format('Ymd_His') . '.json');
        file_put_contents($reportPath, json_encode([
            'csv' => $csvPath,
            'dry_run' => $dryRun,
            'stats' => $stats,
            'missing_town_emails' => $missingTownList,
            'generated_at' => now()->toIso8601String(),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $this->info('Reporte guardado en: ' . $reportPath);

        return self::SUCCESS;
    }

    private function resolveCsvPath(string $pathOption): string
    {
        // Si es absoluta, úsala tal cual. Si no, asúmela dentro de storage/app
        if (str_starts_with($pathOption, '/') || preg_match('/^[A-Za-z]:\\\\/', $pathOption)) {
            return $pathOption;
        }
        return storage_path('app/' . ltrim($pathOption, '/'));
    }

    private function buildIndexMap(array $header): array
    {
        $map = [];
        foreach ($header as $i => $name) {
            $map[mb_strtolower($name)] = $i;
        }
        return $map;
    }

    private function get(array $row, array $idx, string $col): string
    {
        $key = mb_strtolower($col);
        $i = $idx[$key] ?? null;
        if ($i === null) return '';
        return trim((string) ($row[$i] ?? ''));
    }
}
