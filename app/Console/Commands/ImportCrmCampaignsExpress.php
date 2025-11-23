<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\CrmMarketingCampaignsExpressTmp;

class ImportCrmCampaignsExpress extends Command
{
    /**
     * Comandos:
     *  php artisan crm:import-campaigns-express --dry-run
     *  php artisan crm:import-campaigns-express
     */
    protected $signature = 'crm:import-campaigns-express {--dry-run}';

    protected $description = 'Importa campañas express desde campaigns_express.csv a la tabla temporal crm_marketing_campaigns_express_tmp';

    public function handle()
    {
        $config = config('crm_import.campaigns_express');

        $file = $config['file'] ?? null;
        if (! $file || ! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando campañas express desde {$file}");

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
            $this->error('Modelo no válido en config(crm_import.campaigns_express.model).');
            fclose($handle);
            return Command::FAILURE;
        }

        if (! $externalColumn) {
            $this->error('No se ha definido external_id_column en config(crm_import.campaigns_express).');
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

                // Normalizar campos numéricos vacíos -> 0
                foreach (['members_count', 'send_ok', 'send_ko'] as $intField) {
                    if (array_key_exists($intField, $attributes)) {
                        $val = $attributes[$intField];
                        $attributes[$intField] = ($val === '' || $val === null) ? 0 : (int) $val;
                    }
                }

                // Parseo de fechas
                $attributes['created_date'] = $this->parseDateTime(
                    $attributes['created_date'] ?? null
                );

                $attributes['finish_at'] = $this->parseDateTime(
                    $attributes['finish_at'] ?? null
                );

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
                    $this->info("Procesadas {$count} campañas express...");
                }
            }

            fclose($handle);

            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("DRY RUN completado. No se ha guardado nada.");
            } else {
                DB::commit();
                $this->info("Importación completada. Total campañas express: {$count}");
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
     * Intenta parsear una fecha en formato libre tipo:
     *  - d/m/Y H:i
     *  - d/m/Y G:i
     *  - d/m/Y
     *  - Y-m-d H:i:s
     *  Devuelve string Y-m-d H:i:s o null.
     */
    protected function parseDateTime($value): ?string
    {
        if (! $value) {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value->format('Y-m-d H:i:s');
        }

        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value)->format('Y-m-d H:i:s');
        }

        $raw = trim((string) $value);
        if ($raw === '') {
            return null;
        }

        $formats = [
            'Y-m-d H:i:s',
            'Y-m-d',
            'd/m/Y H:i',
            'd/m/Y G:i',
            'd/m/Y',
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
}
