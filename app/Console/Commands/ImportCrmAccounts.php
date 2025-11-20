<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportCrmAccounts extends Command
{
    protected $signature = 'crm:import-accounts {--dry-run}';
    protected $description = 'Importa cuentas desde accounts.csv a la tabla temporal crm_accounts_tmp';

    public function handle()
    {
        $config = config('crm_import.accounts');

        $file = $config['file'];
        if (! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando cuentas desde {$file}");

        $handle = fopen($file, 'r');
        if (! $handle) {
            $this->error('No se pudo abrir el archivo');
            return Command::FAILURE;
        }

        // Detectar delimitador automáticamente (; o ,)
        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, ';') ? ';' : ',';

        // Volver al inicio y leer cabeceras
        rewind($handle);
        $headers = fgetcsv($handle, 0, $delimiter);
        $headers = array_map('trim', $headers);

        $mapping        = $config['mapping'];
        $modelClass     = $config['model'];
        $externalColumn = $config['external_id_column'];
        //$companyId      = $config['company_id'] ?? null;

        $count  = 0;
        $failed = 0;

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                if ($row === [null] || $row === false) {
                    continue;
                }

                $row = array_combine($headers, $row);

                $attributes = [];
                foreach ($mapping as $csvField => $dbField) {
                    $attributes[$dbField] = $row[$csvField] ?? null;
                }

                // if ($companyId) {
                //     $attributes['company_id'] = $companyId;
                // }

                /** @var \Illuminate\Database\Eloquent\Model $model */
                $model = null;
                if (! empty($attributes[$externalColumn])) {
                    $model = $modelClass::query()
                        ->where($externalColumn, $attributes[$externalColumn])
                        ->first();
                }

                if (! $model) {
                    $model = new $modelClass();
                }

                $model->fill($attributes);

                if (! $this->option('dry-run')) {
                    try {
                        $model->save();
                    } catch (\Throwable $e) {
                        $this->error("Error guardando cuenta external_id={$attributes[$externalColumn]}: {$e->getMessage()}");
                        $failed++;
                        continue;
                    }
                }

                $count++;
                if ($count % 500 === 0) {
                    $this->info("Procesadas {$count} cuentas...");
                }
            }

            fclose($handle);

            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("DRY RUN completado. No se ha guardado nada.");
            } else {
                DB::commit();
                $this->info("Importación finalizada. Total cuentas: {$count}");
                if ($failed) {
                    $this->warn("Cuentas con error al guardar: {$failed}");
                }
            }

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);
            $this->error("Error general: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
