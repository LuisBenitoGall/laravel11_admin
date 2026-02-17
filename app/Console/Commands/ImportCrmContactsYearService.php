<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportCrmContactsYearService extends Command
{
    protected $signature = 'crm:import-contacts-year-service {--dry-run}';

    protected $description = 'Importa last_year_service desde contacts_year_service.csv a crm_contacts_year_service_tmp (solo filas con service_last_year)';

    public function handle(): int
    {
        $config = config('crm_import.contacts_year_service');
        if (! $config) {
            $this->error('Configuración crm_import.contacts_year_service no encontrada.');
            return Command::FAILURE;
        }

        $file = $config['file'];
        if (! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando last_year_service desde {$file}");

        $handle = fopen($file, 'r');
        if (! $handle) {
            $this->error('No se pudo abrir el archivo');
            return Command::FAILURE;
        }

        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, "\t") ? "\t" : (str_contains($firstLine, ';') ? ';' : ',');
        rewind($handle);
        $headers = fgetcsv($handle, 0, $delimiter);
        $headers = array_map(function ($h) {
            $h = preg_replace('/^\xEF\xBB\xBF/', '', (string) $h); // BOM UTF-8
            return strtolower(trim($h));
        }, $headers);

        $mapping = $config['mapping'];
        $modelClass = $config['model'];

        DB::beginTransaction();

        try {
            $count = 0;
            $skipped = 0;
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                if ($row === [null] || $row === false) {
                    continue;
                }
                $row = array_combine($headers, array_pad($row, count($headers), null));

                $serviceLastYear = isset($row['service_last_year'])
                    ? trim((string) $row['service_last_year'])
                    : '';
                if ($serviceLastYear === '') {
                    $skipped++;
                    continue;
                }

                $year = filter_var($serviceLastYear, FILTER_VALIDATE_INT);
                if ($year === false || $year < 2000 || $year > 2100) {
                    $skipped++;
                    continue;
                }

                $attributes = [];
                foreach ($mapping as $csvField => $dbField) {
                    $raw = isset($row[$csvField]) ? trim((string) $row[$csvField]) : null;
                    if ($raw === '') {
                        $raw = null;
                    }
                    $attributes[$dbField] = $dbField === 'service_last_year' ? $year : $raw;
                }

                $model = new $modelClass();
                $model->fill($attributes);
                if (! $this->option('dry-run')) {
                    $model->save();
                }
                $count++;
                if ($count % 500 === 0) {
                    $this->info("Procesados {$count} registros...");
                }
            }
            fclose($handle);

            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("DRY RUN completado. No se ha guardado nada. Registros que se habrían importado: {$count}. Omitidos (sin service_last_year válido): {$skipped}");
            } else {
                DB::commit();
                $this->info("Importación completada. Total registros importados: {$count}. Omitidos: {$skipped}");
            }
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            if (is_resource($handle)) {
                fclose($handle);
            }
            $this->error("Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
