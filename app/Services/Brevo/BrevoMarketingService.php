<?php

namespace App\Services\Brevo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

//Models:
use App\Models\MarketingList;
use App\Models\MarketingListUser;
use App\Models\User;

class BrevoMarketingService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('brevo.base_url'), '/');
        $this->apiKey  = (string) config('brevo.api_key');
        $this->timeout = (int) config('brevo.timeout', 10);
    }

    /**
     * Crea o actualiza la lista remota en Brevo
     * y guarda brevo_list_id / brevo_folder_id en el modelo.
     *
     * - Si la lista ya existe en CRM con brevo_list_id: PUT nombre (sobrescritura del título en Brevo).
     * - Si la lista fue borrada en Brevo (404) o no coincide: se limpia brevo_list_id y se crea de nuevo
     *   o se reutiliza una lista del mismo nombre en la carpeta (evita duplicados en Brevo).
     */
    public function ensureRemoteList(MarketingList $list): MarketingList
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('Brevo API key not configured.');
        }

        $this->ensureRemoteFolder($list);
        $list->refresh();

        $remoteName = $this->buildRemoteListName($list);

        // 1) Ya tenemos ID remoto: actualizar nombre; si la lista ya no existe, recrear/re-enlazar
        if ($list->brevo_list_id) {
            $put = $this->client()
                ->put($this->url("/contacts/lists/{$list->brevo_list_id}"), [
                    'name' => $remoteName,
                ]);

            if ($put->successful()) {
                $list->brevo_sync_status = 'ok';
                $list->brevo_sync_error = null;
                $list->save();

                return $list;
            }

            $gone = in_array($put->status(), [404, 410], true);

            if ($gone) {
                Log::info('Brevo: lista remota inexistente, se vuelve a crear o enlazar', [
                    'crm_list_id' => $list->id,
                    'brevo_list_id' => $list->brevo_list_id,
                    'status' => $put->status(),
                ]);
                $list->brevo_list_id = null;
                $list->save();
                $list->refresh();
            } else {
                $putBody = $put->json();
                Log::warning('Brevo: error al actualizar lista remota', [
                    'list_id' => $list->id,
                    'brevo_id' => $list->brevo_list_id,
                    'status' => $put->status(),
                    'body' => $put->body(),
                ]);
                $list->brevo_sync_status = 'error';
                $list->brevo_sync_error  = is_array($putBody) ? ($putBody['message'] ?? $put->body()) : $put->body();
                $list->save();

                return $list;
            }
        }

        // 2) Crear lista en Brevo o enlazar una ya existente en la misma carpeta (mismo nombre)
        if (! $list->brevo_list_id) {
            $payload = [
                'name' => $remoteName,
                'folderId' => $list->brevo_folder_id,
            ];

            try {
                $response = $this->client()
                    ->post($this->url('/contacts/lists'), $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    $list->brevo_list_id = $data['id'] ?? null;
                    $list->brevo_sync_status = 'ok';
                    $list->brevo_sync_error = null;
                    $list->save();

                    return $list;
                }

                // Creación rechazada (p. ej. nombre duplicado en carpeta): intentar enlazar lista existente
                $existingId = $this->findListIdInFolderByName((int) $list->brevo_folder_id, $remoteName);
                if ($existingId !== null) {
                    $list->brevo_list_id = $existingId;
                    $list->brevo_sync_status = 'ok';
                    $list->brevo_sync_error = null;
                    $list->save();

                    // Alinear nombre remoto por si cambió solo en CRM
                    $this->client()->put($this->url("/contacts/lists/{$existingId}"), ['name' => $remoteName]);

                    return $list;
                }

                $body = $response->json();
                $list->brevo_sync_status = 'error';
                $list->brevo_sync_error = is_array($body) ? ($body['message'] ?? $response->body()) : $response->body();
                $list->save();

                throw new \RuntimeException('Brevo error creating list: '.$response->body());
            } catch (Throwable $e) {
                Log::error('Brevo: exception creating list', [
                    'list_id' => $list->id,
                    'error' => $e->getMessage(),
                ]);

                $list->brevo_sync_status = 'error';
                $list->brevo_sync_error = $e->getMessage();
                $list->save();

                throw $e;
            }
        }

        return $list;
    }

    /**
     * Busca en una carpeta de Brevo una lista con el nombre exacto indicado.
     */
    protected function findListIdInFolderByName(int $folderId, string $name): ?int
    {
        $target = trim($name);
        if ($target === '') {
            return null;
        }

        $limit = 50;
        $offset = 0;

        while (true) {
            $response = $this->client()
                ->get($this->url("/contacts/folders/{$folderId}/lists"), [
                    'limit' => $limit,
                    'offset' => $offset,
                    'sort' => 'asc',
                ]);

            if ($response->failed()) {
                Log::warning('Brevo: no se pudieron listar listas de carpeta', [
                    'folder_id' => $folderId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $data = $response->json();
            $lists = $data['lists'] ?? [];

            if (! is_array($lists) || $lists === []) {
                break;
            }

            foreach ($lists as $row) {
                if (! empty($row['id']) && isset($row['name']) && trim((string) $row['name']) === $target) {
                    return (int) $row['id'];
                }
            }

            if (count($lists) < $limit) {
                break;
            }

            $offset += $limit;
        }

        return null;
    }

    /**
     * Sincroniza los miembros de una lista hacia Brevo.
     * Crea/actualiza contactos y los asigna a la lista Brevo.
     */
    public function syncListMembers(MarketingList $list): void
    {
        if (!$list->brevo_list_id) {
            $this->ensureRemoteList($list);
        }

        // 1) Estado en CRM
        $members = MarketingListUser::query()
            ->where('marketing_list_id', $list->id)
            ->where('status', 1)
            ->with(['user' => function ($q) {
                $q->where('status', 1);
            }])
            ->get()
            ->filter(fn (MarketingListUser $mlu) => $mlu->user !== null && !empty($mlu->user->email));

        // Map CRM: email => User
        $crmByEmail = [];
        foreach ($members as $mlu) {
            $email = strtolower(trim($mlu->user->email));
            if ($email !== '') {
                $crmByEmail[$email] = $mlu->user;
            }
        }

        $crmEmails = array_keys($crmByEmail);

        // Si no hay miembros en CRM, la lista debería quedar vacía en Brevo
        // (es decir, quitamos todos los contactos de la lista remota).
        // 2) Estado actual en Brevo
        $brevoEmails = $this->fetchListEmailsFromBrevo($list->brevo_list_id);

        $toAddOrUpdate = array_diff($crmEmails, []); // todos los de CRM se aseguran arriba
        $toRemove      = array_diff($brevoEmails, $crmEmails);

        $errors = [];
        $processed = 0;

        // 3) Altas/updates: para cada email del CRM, upsert + asignar a lista
        foreach ($toAddOrUpdate as $email) {
            $user = $crmByEmail[$email] ?? null;
            if (! $user) {
                continue;
            }

            try {
                $err = $this->upsertContactForList($user, $list, $email);
                if ($err !== null) {
                    $errors[] = $err;
                } else {
                    $processed++;
                }
            } catch (Throwable $e) {
                $errors[] = [
                    'email' => $email,
                    'stage' => 'upsert',
                    'status' => null,
                    'error' => $e->getMessage(),
                ];
            }
        }

        // 4) Bajas: quitar de la lista los que están en Brevo pero no en CRM
        if (!empty($toRemove)) {
            // Brevo suele aceptar lotes, pero vamos a ser prudentes y trocear
            $chunks = array_chunk($toRemove, 1000);
            foreach ($chunks as $chunk) {
                try {
                    $payload = [
                        'emails' => array_values($chunk),
                    ];

                    $response = $this->client()
                        ->post($this->url("/contacts/lists/{$list->brevo_list_id}/contacts/remove"), $payload);

                    if ($response->failed()) {
                        $body = $response->json();
                        $errors[] = [
                            'emails' => $chunk,
                            'stage'  => 'remove',
                            'status' => $response->status(),
                            'error'  => $body['message'] ?? $response->body(),
                        ];
                    }
                } catch (Throwable $e) {
                    $errors[] = [
                        'emails' => $chunk,
                        'stage'  => 'remove',
                        'status' => null,
                        'error'  => $e->getMessage(),
                    ];
                }
            }
        }

        // 5) Guardar estado final de sync
        if (!empty($errors)) {
            Log::warning('Brevo: sync errors', [
                'list_id' => $list->id,
                'errors'  => $errors,
            ]);

            $list->brevo_synced_at   = now();
            $list->brevo_sync_status = $processed > 0 ? 'partial' : 'error';
            $list->brevo_sync_error  = json_encode($errors);
            $list->save();
        } else {
            $list->brevo_synced_at   = now();
            $list->brevo_sync_status = 'ok';
            $list->brevo_sync_error  = null;
            $list->save();
        }
    }

    /**
     * Crea el contacto en Brevo o, si ya existe, lo actualiza y lo asocia a la lista (sobrescritura).
     *
     * @return array<string, mixed>|null Error estructurado o null si OK
     */
    protected function upsertContactForList(User $user, MarketingList $list, string $email): ?array
    {
        $payload = [
            'email' => $email,
            'attributes' => $this->mapUserAttributes($user),
            'listIds' => [$list->brevo_list_id],
            'updateEnabled' => true,
        ];

        $response = $this->client()
            ->post($this->url('/contacts'), $payload);

        if ($response->successful()) {
            return null;
        }

        $body = $response->json();
        $message = strtolower((string) (is_array($body) ? ($body['message'] ?? '') : ''));

        // Contacto ya existente: PUT añade a listIds y actualiza atributos
        if ($response->status() === 400
            && (
                str_contains($message, 'already')
                || str_contains($message, 'duplicate')
                || str_contains($message, 'exist')
                || str_contains($message, 'associated')
            )) {
            $put = $this->client()
                ->put($this->url('/contacts/' . rawurlencode($email)), [
                    'attributes' => $this->mapUserAttributes($user),
                    'listIds' => [$list->brevo_list_id],
                ]);

            if ($put->successful()) {
                return null;
            }

            $putBody = $put->json();

            return [
                'email' => $email,
                'stage' => 'upsert_put',
                'status' => $put->status(),
                'error' => is_array($putBody) ? ($putBody['message'] ?? $put->body()) : $put->body(),
            ];
        }

        return [
            'email' => $email,
            'stage' => 'upsert',
            'status' => $response->status(),
            'error' => is_array($body) ? ($body['message'] ?? $response->body()) : $response->body(),
        ];
    }

    /**
     * Nombre que verá la clienta en Brevo.
     */
    protected function buildRemoteListName(MarketingList $list): string
    {
        $base = $list->name;

        // Por si quieres asegurar unicidad visual por empresa:
        if ($list->company_id) {
            $base .= ' [ERP#'.$list->company_id.'-'.$list->id.']';
        }

        return Str::limit($base, 80, '…');
    }

    /**
     * Mapea atributos del User a atributos personalizados de Brevo.
     * Aquí NO inventamos columnas de User: sólo usamos name, surname, email.
     */
    protected function mapUserAttributes(User $user): array
    {
        return [
            'FIRSTNAME' => $user->name,
            'LASTNAME'  => $user->surname,
            // Si más tarde quieres mapear empresa, teléfonos, etc.,
            // aquí tendrás que ajustar usando campos REALES.
        ];
    }

    /**
     * Cliente HTTP básico para Brevo.
     */
    protected function client()
    {
        return Http::timeout($this->timeout)
            ->withHeaders([
                'api-key'      => $this->apiKey,
                'accept'       => 'application/json',
                'content-type' => 'application/json',
            ]);
    }

    protected function url(string $path): string
    {
        return $this->baseUrl.'/'.ltrim($path, '/');
    }

    /**
     * Obtiene todos los emails asociados a una lista de Brevo.
     * 
     * Aquí la implementación depende de cómo exponga Brevo los contactos por lista.
     * Lo que hacemos es paginar hasta que no haya más resultados.
     */
    protected function fetchListEmailsFromBrevo(int $brevoListId): array
    {
        $allEmails = [];
        $limit = 500;
        $offset = 0;

        while (true) {
            try {
                $response = $this->client()
                    ->get($this->url("/contacts/lists/{$brevoListId}/contacts"), [
                        'limit'  => $limit,
                        'offset' => $offset,
                    ]);

                if ($response->failed()) {
                    Log::warning('Brevo: error fetching list contacts', [
                        'brevo_list_id' => $brevoListId,
                        'status'        => $response->status(),
                        'body'          => $response->body(),
                    ]);
                    break;
                }

                $data = $response->json();

                $contacts = $data['contacts'] ?? $data['items'] ?? [];
                if (empty($contacts)) {
                    break;
                }

                foreach ($contacts as $contact) {
                    if (!empty($contact['email'])) {
                        $email = strtolower(trim($contact['email']));
                        if ($email !== '') {
                            $allEmails[$email] = true;
                        }
                    }
                }

                // Si devuelve menos que el límite, hemos llegado al final
                if (count($contacts) < $limit) {
                    break;
                }

                $offset += $limit;
            } catch (Throwable $e) {
                Log::error('Brevo: exception fetching list contacts', [
                    'brevo_list_id' => $brevoListId,
                    'error'         => $e->getMessage(),
                ]);
                break;
            }
        }

        return array_keys($allEmails);
    }

    /**
     * Crea una carpeta en Brevo para esta lista si todavía no tiene.
     *
     * De momento: una carpeta por lista.
     * Más adelante, si quieres, puedes pasar a carpeta por empresa.
     */
    protected function ensureRemoteFolder(MarketingList $list): void
    {
        if ($list->brevo_folder_id) {
            $check = $this->client()
                ->get($this->url("/contacts/folders/{$list->brevo_folder_id}"));

            if ($check->successful()) {
                return;
            }

            $gone = in_array($check->status(), [404, 410], true);

            if ($gone) {
                Log::info('Brevo: carpeta remota inexistente, se vuelve a crear', [
                    'crm_list_id' => $list->id,
                    'brevo_folder_id' => $list->brevo_folder_id,
                ]);

                $list->brevo_folder_id = null;
                $list->brevo_list_id = null;
                $list->save();
                $list->refresh();
            } else {
                $body = $check->json();
                $message = is_array($body) ? ($body['message'] ?? $check->body()) : $check->body();

                $list->brevo_sync_status = 'error';
                $list->brevo_sync_error = $message;
                $list->save();

                throw new \RuntimeException('Brevo error validating folder: '.$check->body());
            }
        }

        // Nombre base de la carpeta
        $rawName = sprintf(
            'ERP %s - %s',
            $list->company_id ?: '-',
            $list->name ?: ('Lista '.$list->id)
        );

        // Brevo exige <= 50 caracteres
        $folderName = Str::limit($rawName, 50, ''); // sin puntos suspensivos para no regalar caracteres

        $payload = [
            'name' => $folderName,
        ];

        try {
            $response = $this->client()
                ->post($this->url('/contacts/folders'), $payload);

            if ($response->failed()) {
                $body = $response->json();

                $list->brevo_sync_status = 'error';
                $list->brevo_sync_error  = $body['message'] ?? $response->body();
                $list->save();

                throw new \RuntimeException('Brevo error creating folder: '.$response->body());
            }

            $data = $response->json();
            $folderId = $data['id'] ?? null;

            if (!$folderId) {
                throw new \RuntimeException('Brevo folder id missing in response.');
            }

            $list->brevo_folder_id   = $folderId;
            $list->brevo_sync_status = 'ok';
            $list->brevo_sync_error  = null;
            $list->save();
        } catch (Throwable $e) {
            Log::error('Brevo: exception creating folder', [
                'list_id' => $list->id,
                'error'   => $e->getMessage(),
            ]);

            $list->brevo_sync_status = 'error';
            $list->brevo_sync_error  = $e->getMessage();
            $list->save();

            throw $e;
        }
    }

}
