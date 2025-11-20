<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportCrmContacts extends Command
{
    protected $signature = 'crm:import-contacts {--dry-run}';
    protected $description = 'Importa contactos desde contacts.csv a la tabla temporal crm_contacts_tmp';

    public function handle()
    {
        $config = config('crm_import.contacts');

        $file = $config['file'];
        if (! file_exists($file)) {
            $this->error("Archivo no encontrado: {$file}");
            return Command::FAILURE;
        }

        $this->info("Importando contactos desde {$file}");

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
        $headers = array_map('trim', $headers);

        $mapping        = $config['mapping'];
        $modelClass     = $config['model'];
        $externalColumn = $config['external_id_column'];

        DB::beginTransaction();

        try {
            $count = 0;

            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                // Ignorar líneas vacías
                if ($row === [null] || $row === false) {
                    continue;
                }

                $row = array_combine($headers, $row);

                $attributes = [];
                foreach ($mapping as $csvField => $dbField) {
                    $attributes[$dbField] = $row[$csvField] ?? null;
                }

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
                    $model->save();
                }

                $count++;
                if ($count % 500 === 0) {
                    $this->info("Procesados {$count} contactos...");
                }
            }

            fclose($handle);

            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("DRY RUN completado. No se ha guardado nada.");
            } else {
                DB::commit();
                $this->info("Importación completada. Total contactos: {$count}");
            }

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
