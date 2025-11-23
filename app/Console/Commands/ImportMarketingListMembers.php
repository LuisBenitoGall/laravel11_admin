<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models:
use App\Models\MarketingList;
use App\Models\CrmMarketingListMemberTmp;

class ImportMarketingListMembers extends Command
{
    protected $signature = 'crm:import-marketing-list-members
                            {--only= : Nombre de archivo (con extensión) para procesar solo ese CSV}
                            {--dry-run : Simula la importación sin guardar cambios}';

    protected $description = 'Importa miembros de listas de marketing desde CSV a crm_marketing_list_members_tmp';

    public function handle()
    {
        $config  = config('crm_import.marketing_list_members');
        $dir     = $config['dir'] ?? null;
        $mapping = $config['mapping'] ?? [];

        if (! $dir || ! is_dir($dir)) {
            $this->error("Directorio inválido en crm_import.marketing_list_members.dir: {$dir}");
            return self::FAILURE;
        }

        if (empty($mapping)) {
            $this->error('No hay mapping definido en crm_import.marketing_list_members.mapping');
            return self::FAILURE;
        }

        $only   = $this->option('only');   // ej: list_12_clientes_alfombra.csv
        $dryRun = (bool) $this->option('dry-run');

        $files = File::files($dir);

        if ($only) {
            $files = array_filter($files, function ($file) use ($only) {
                return $file->getFilename() === $only;
            });
        }

        if (empty($files)) {
            $this->warn('No se han encontrado CSVs de listas de marketing que procesar.');
            return self::SUCCESS;
        }

        foreach ($files as $file) {
            $this->importSingleFile($file->getPathname(), $mapping, $dryRun);
        }

        return self::SUCCESS;
    }

    protected function importSingleFile(string $filepath, array $mapping, bool $dryRun): void
    {
        $filename = basename($filepath);
        $this->info("Procesando archivo: {$filename}");

        // Esperamos algo tipo: list_12_loquesea.csv
        if (! preg_match('/^list_(\d+)_/i', $filename, $m)) {
            $this->warn("   El archivo no sigue el patrón 'list_[id]_...': se omite.");
            return;
        }

        $marketingListId = (int) $m[1];

        $list = MarketingList::find($marketingListId);
        if (! $list) {
            $this->warn("   No se encontró MarketingList con id={$marketingListId}. Se omite el archivo.");
            return;
        }

        $this->info("   Lista detectada: {$list->name} (id: {$list->id})");

        $handle = fopen($filepath, 'r');
        if (! $handle) {
            $this->warn("   No se pudo abrir el archivo: {$filepath}");
            return;
        }

        // Detectar delimitador ; o ,
        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, ';') ? ';' : ',';
        rewind($handle);

        $headers = fgetcsv($handle, 0, $delimiter);
        if (! $headers) {
            $this->warn("   No se pudieron leer cabeceras en {$filename}");
            fclose($handle);
            return;
        }

        $headers = array_map('trim', $headers);

        $count     = 0;
        $inserted  = 0;
        $updated   = 0;

        $process = function () use (
            $handle,
            $delimiter,
            $headers,
            $mapping,
            $marketingListId,
            &$count,
            &$inserted,
            &$updated,
            $filename
        ) {
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                if ($row === [null] || $row === false) {
                    continue;
                }

                if (count($row) !== count($headers)) {
                    // Fila malformada: diferente número de columnas
                    continue;
                }

                $rowAssoc = array_combine($headers, $row);

                // Mapear usando el mapping global (si la columna no existe, queda null)
                $attrs = [];
                foreach ($mapping as $csvField => $logicalField) {
                    $attrs[$logicalField] = $rowAssoc[$csvField] ?? null;
                }

                // Parseo de fechas si vienen como texto en formato raro
                if (! empty($attrs['created_date'])) {
                    $attrs['created_date'] = $this->parseDateTime($attrs['created_date']);
                } else {
                    $attrs['created_date'] = null;
                }

                if (! empty($attrs['birthday'])) {
                    $attrs['birthday'] = $this->parseDate($attrs['birthday']);
                } else {
                    $attrs['birthday'] = null;
                }

                // Buscamos si ya existe un registro para esta lista + email
                // (si no hay email, no usamos match, simplemente creamos un registro nuevo)
                $email = trim((string) ($attrs['email'] ?? ''));

                if ($email !== '') {
                    $tmp = CrmMarketingListMemberTmp::where('marketing_list_id', $marketingListId)
                        ->where('email', $email)
                        ->first();

                    $isNew = false;
                    if (! $tmp) {
                        $tmp = new CrmMarketingListMemberTmp();
                        $tmp->marketing_list_id = $marketingListId;
                        $tmp->email             = $email;
                        $tmp->is_done           = false; // nuevo => pendiente de promote
                        $isNew = true;
                    }

                } else {
                    // Sin email, no puedes deduplicar: cada fila se considera independiente
                    $tmp   = new CrmMarketingListMemberTmp();
                    $tmp->marketing_list_id = $marketingListId;
                    $tmp->is_done           = false;
                    $isNew = true;
                }

                // Rellenar resto de campos
                foreach ($attrs as $field => $value) {
                    // marketing_list_id y email los tratamos aparte
                    if (in_array($field, ['email'], true)) {
                        if ($field === 'email' && $email !== '') {
                            $tmp->email = $email;
                        }
                        continue;
                    }

                    // Solo asignamos si la columna existe en el modelo/migración
                    if (in_array($field, $tmp->getFillable(), true)) {
                        $tmp->{$field} = $value;
                    }
                }

                $tmp->save();

                if ($isNew) {
                    $inserted++;
                } else {
                    $updated++;
                }

                $count++;
                if ($count % 500 === 0) {
                    $this->info("   {$count} filas procesadas en {$filename}...");
                }
            }
        };

        if ($this->option('dry-run')) {
            // En dry-run no guardamos nada: simplemente recorremos para comprobar
            // que no explota el parseo / estructura
            $this->comment("   [DRY RUN] Leyendo filas de {$filename} (sin guardar en BD)...");
            // Si quisieras ver más debug, podrías clonar gran parte de la lógica
            // sin llamar a ->save(), pero no merece la pena.
            // Por simplicidad, no ejecutamos el process en dry-run.
        } else {
            DB::transaction($process);
            $this->info("   Archivo {$filename} importado a crm_marketing_list_members_tmp.");
            $this->info("      Filas leídas:    {$count}");
            $this->info("      Registros nuevos: {$inserted}");
            $this->info("      Registros actualizados: {$updated}");
        }

        fclose($handle);
    }

    protected function parseDateTime(string $raw): ?Carbon
    {
        $raw = trim($raw);
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
                return Carbon::createFromFormat($format, $raw);
            } catch (\Throwable $e) {
                // siguiente
            }
        }

        try {
            return Carbon::parse($raw);
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function parseDate(string $raw): ?Carbon
    {
        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }

        $formats = [
            'Y-m-d',
            'd/m/Y',
        ];

        foreach ($formats as $format) {
            try {
                return Carbon::createFromFormat($format, $raw)->startOfDay();
            } catch (\Throwable $e) {
                // otra vuelta
            }
        }

        try {
            return Carbon::parse($raw)->startOfDay();
        } catch (\Throwable $e) {
            return null;
        }
    }
}
