<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ImportCrmCampaigns extends Command
{
    /**
     * Comandos:
     *  php artisan crm:import-campaigns --dry-run
     *  php artisan crm:import-campaigns
     */
    protected $signature = 'crm:import-campaigns {--dry-run}';

    protected $description = 'Importa campañas desde campaigns.csv a la tabla temporal crm_marketing_campaigns_tmp';

    public function handle()
    {
        $config = config('crm_import.campaigns');

        $file = $config['file'] ?? null;
        if (! $file || ! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando campañas desde {$file}");

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
            $this->error('Modelo no válido en config(crm_import.campaigns.model).');
            fclose($handle);
            return Command::FAILURE;
        }

        if (! $externalColumn) {
            $this->error('No se ha definido external_id_column en config(crm_import.campaigns).');
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

                // 🔹 Fechas: created_date, start_at, finish_at
                if (array_key_exists('created_date', $attributes)) {
                    $attributes['created_date'] = $this->parseDateTime($attributes['created_date']);
                }

                if (array_key_exists('start_at', $attributes)) {
                    $attributes['start_at'] = $this->parseDateTime($attributes['start_at']);
                }

                if (array_key_exists('finish_at', $attributes)) {
                    $attributes['finish_at'] = $this->parseDateTime($attributes['finish_at']);
                }

                // 🔹 Coste total: normalizar a decimal (o null)
                if (array_key_exists('total_cost', $attributes)) {
                    $attributes['total_cost'] = $this->normalizeDecimal($attributes['total_cost']);
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
                    $this->info("Procesadas {$count} campañas...");
                }
            }

            fclose($handle);

            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("DRY RUN completado. No se ha guardado nada.");
            } else {
                DB::commit();
                $this->info("Importación completada. Total campañas: {$count}");
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
    protected function parseDateTime($value): ?string
    {
        if ($value instanceof Carbon) {
            return $value->format('Y-m-d H:i:s');
        }

        $raw = $value !== null ? trim((string) $value) : '';

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
                // siguiente formato
            }
        }

        try {
            return Carbon::parse($raw)->format('Y-m-d H:i:s');
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Normaliza un decimal que viene en string desde el CSV.
     * Maneja:
     *  - vacío  -> null
     *  - "1.234,56" -> 1234.56
     *  - "1234,56"  -> 1234.56
     *  - "1234.56"  -> 1234.56
     */
    protected function normalizeDecimal($value): ?float
    {
        if ($value === null) {
            return null;
        }

        $raw = trim((string) $value);
        if ($raw === '') {
            return null;
        }

        // Si lleva coma como separador decimal
        if (str_contains($raw, ',')) {
            // Quitar separadores de miles tipo "." si los hubiera
            $raw = str_replace('.', '', $raw);
            // Cambiar coma por punto
            $raw = str_replace(',', '.', $raw);
        }

        if (! is_numeric($raw)) {
            return null;
        }

        return (float) $raw;
    }

    protected function myLogica()
    {
        // Aquí, si quieres, te haces tu versión “a pelo” para pruebas.
    }
}
