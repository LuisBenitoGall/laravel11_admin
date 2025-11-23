<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ImportCrmPotentialCustomers extends Command
{
    /**
     * Comandos:
     * php artisan crm:import-potential-customers --dry-run
     * php artisan crm:import-potential-customers
     */

    protected $signature = 'crm:import-potential-customers {--dry-run}';
    protected $description = 'Importa clientes potenciales desde clientes_potenciales.csv a la tabla temporal crm_potential_customers_tmp';

    public function handle()
    {
        $config = config('crm_import.potential_customers');

        $file = $config['file'] ?? null;
        if (! $file || ! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando clientes potenciales desde {$file}");

        $handle = fopen($file, 'r');
        if (! $handle) {
            $this->error('No se pudo abrir el archivo');
            return Command::FAILURE;
        }

        // Detectar delimitador automáticamente (; o ,)
        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, ';') ? ';' : ',';

        // Volver al inicio del archivo y leer cabeceras
        rewind($handle);
        $headers = fgetcsv($handle, 0, $delimiter);
        if (! $headers) {
            $this->error('No se han podido leer las cabeceras del CSV.');
            fclose($handle);
            return Command::FAILURE;
        }

        $headers = array_map('trim', $headers);

        $mapping        = $config['mapping'] ?? [];
        $modelClass     = $config['model'] ?? null;
        $externalColumn = $config['external_id_column'] ?? null;

        if (! $modelClass || ! class_exists($modelClass)) {
            $this->error('Modelo no válido en config(crm_import.potential_customers.model).');
            fclose($handle);
            return Command::FAILURE;
        }

        if (! $externalColumn) {
            $this->error('No se ha definido external_id_column en config(crm_import.potential_customers).');
            fclose($handle);
            return Command::FAILURE;
        }

        DB::beginTransaction();

        try {
            $count = 0;

            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                // Ignorar líneas vacías
                if ($row === [null] || $row === false) {
                    continue;
                }

                if (count($row) !== count($headers)) {
                    $this->warn("Fila con número de columnas distinto a las cabeceras, se omite (línea aproximada {$count}).");
                    continue;
                }

                $row = array_combine($headers, $row);

                $attributes = [];
                foreach ($mapping as $csvField => $dbField) {
                    $attributes[$dbField] = $row[$csvField] ?? null;
                }

                if ($count < 5) {
                    $this->info('---- DEBUG FILA #' . ($count + 1) . ' ----');
                    $this->info('Headers: ' . implode(' | ', $headers));
                    $this->info('RAW created_date: ' . ($row['created_date'] ?? '<<NO KEY>>'));
                    $this->info('ATTR created_date (antes de parsear): ' . ($attributes['created_date'] ?? 'NULL'));
                }                

                // 🔹 Parseo de created_date del CSV -> DATETIME MySQL
                if (! empty($attributes['created_date'])) {
                    $raw = trim($attributes['created_date']);
                    $parsed = null;

                    if ($raw !== '') {
                        // 1) d/m/Y H:i (por si la hora viene 09:51)
                        try {
                            $parsed = Carbon::createFromFormat('d/m/Y H:i', $raw);
                        } catch (\Throwable $e) {
                            // 2) d/m/Y G:i (hora sin cero inicial → "9:51")
                            try {
                                $parsed = Carbon::createFromFormat('d/m/Y G:i', $raw);
                            } catch (\Throwable $e2) {
                                // 3) sólo fecha d/m/Y
                                try {
                                    $parsed = Carbon::createFromFormat('d/m/Y', $raw);
                                } catch (\Throwable $e3) {
                                    $parsed = null;
                                }
                            }
                        }
                    }

                    if ($count < 5) {
                        $this->info('ATTR created_date (después parseo): ' . ($parsed ? $parsed->format('Y-m-d H:i:s') : 'NULL'));
                    }

                    $attributes['created_date'] = $parsed
                        ? $parsed->format('Y-m-d H:i:s')
                        : null;
                } else {
                    $attributes['created_date'] = null;
                }

                /** @var \Illuminate\Database\Eloquent\Model|null $model */
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
                    $model->save();
                }

                $count++;
                if ($count % 500 === 0) {
                    $this->info("Procesados {$count} clientes potenciales...");
                }
            }

            fclose($handle);

            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("DRY RUN completado. No se ha guardado nada.");
            } else {
                DB::commit();
                $this->info("Importación completada. Total clientes potenciales: {$count}");
            }

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);
            $this->error("Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    protected function myLogica()
    {
        // Lo de siempre: aquí trasteas tú si te apetece.
    }
}
