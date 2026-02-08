<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportCrmContactsExtra extends Command
{
    protected $signature = 'crm:import-contacts-extra {--dry-run}';
    protected $description = 'Importa datos adicionales de contactos desde contacts_all.csv a la tabla temporal crm_contacts_extra_tmp';

    public function handle()
    {
        $config = config('crm_import.contacts_extra');
        if (! $config) {
            $this->error('Configuración crm_import.contacts_extra no encontrada.');
            return Command::FAILURE;
        }

        $file = $config['file'];
        if (! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando contactos extra desde {$file}");

        $handle = fopen($file, 'r');
        if (! $handle) {
            $this->error('No se pudo abrir el archivo');
            return Command::FAILURE;
        }

        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, "\t") ? "\t" : (str_contains($firstLine, ';') ? ';' : ',');
        rewind($handle);
        $headers = fgetcsv($handle, 0, $delimiter);
        $headers = array_map('trim', $headers);

        $mapping = $config['mapping'];
        $modelClass = $config['model'];

        DB::beginTransaction();

        try {
            $count = 0;
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                if ($row === [null] || $row === false) {
                    continue;
                }
                $row = array_combine($headers, $row);
                $attributes = [];
                foreach ($mapping as $csvField => $dbField) {
                    $attributes[$dbField] = isset($row[$csvField]) ? trim((string) $row[$csvField]) : null;
                    if ($attributes[$dbField] === '') {
                        $attributes[$dbField] = null;
                    }
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
                $this->info("DRY RUN completado. No se ha guardado nada. Registros que se habrían importado: {$count}");
            } else {
                DB::commit();
                $this->info("Importación completada. Total registros: {$count}");
            }
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);
            $this->error("Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
