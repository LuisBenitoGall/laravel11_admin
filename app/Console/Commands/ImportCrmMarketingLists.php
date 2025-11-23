<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ImportCrmMarketingLists extends Command
{
    /**
     * Comandos:
     *  php artisan crm:import-marketing-lists --dry-run
     *  php artisan crm:import-marketing-lists
     */
    protected $signature = 'crm:import-marketing-lists {--dry-run}';

    protected $description = 'Importa listas de marketing desde listas_marketing.csv a la tabla temporal crm_marketing_lists_tmp';

    public function handle()
    {
        $config = config('crm_import.marketing_lists');

        $file = $config['file'] ?? null;
        if (! $file || ! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando listas de marketing desde {$file}");

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
            $this->error('Modelo no válido en config(crm_import.marketing_lists.model).');
            fclose($handle);
            return Command::FAILURE;
        }

        if (! $externalColumn) {
            $this->error('No se ha definido external_id_column en config(crm_import.marketing_lists).');
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

                // Normalizar fechas: last_use y created_date
                $attributes['last_use']     = $this->parseDateTime($attributes['last_use'] ?? null);
                $attributes['created_date'] = $this->parseDateTime($attributes['created_date'] ?? null);

                // 🔹 Normalizar num_members (int) para evitar el '' de los CSV
                if (array_key_exists('num_members', $attributes)) {
                    $raw = trim((string) $attributes['num_members']);

                    // si quieres que los vacíos sean NULL:
                    $attributes['num_members'] = $raw === '' ? null : (int) $raw;

                    // alternativa: si los quieres como 0
                    // $attributes['num_members'] = $raw === '' ? 0 : (int) $raw;
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
                    $this->info("Procesadas {$count} listas de marketing...");
                }
            }

            fclose($handle);

            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("DRY RUN completado. No se ha guardado nada.");
            } else {
                DB::commit();
                $this->info("Importación completada. Total listas de marketing: {$count}");
            }

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);
            $this->error("Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    /**
     * Intenta parsear una fecha/hora procedente del CSV a formato DATETIME MySQL.
     */
    protected function parseDateTime(?string $raw): ?string
    {
        $raw = $raw !== null ? trim($raw) : '';

        if ($raw === '') {
            return null;
        }

        $formats = [
            'd/m/Y H:i',
            'd/m/Y G:i',
            'd/m/Y',
            'Y-m-d H:i:s',
            'Y-m-d',
        ];

        foreach ($formats as $format) {
            try {
                $dt = Carbon::createFromFormat($format, $raw);
                if ($dt !== false) {
                    return $dt->format('Y-m-d H:i:s');
                }
            } catch (\Throwable $e) {
                // intentamos el siguiente formato
            }
        }

        // Si no lo conseguimos parsear, mejor devolver null que explotar
        return null;
    }

    protected function myLogica()
    {
        // Por si quieres hacer pruebas “a pelo” algún día.
    }
}
