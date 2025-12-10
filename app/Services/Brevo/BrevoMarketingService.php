<?php

namespace App\Services\Brevo;

use App\Models\MarketingList;
use App\Models\MarketingListUser;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

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
     */
    public function ensureRemoteList(MarketingList $list): MarketingList
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('Brevo API key not configured.');
        }

        // 1) Asegurar carpeta remota
        $this->ensureRemoteFolder($list);

        // 2) Si ya tiene lista en Brevo, opcionalmente actualizamos nombre y salimos
        if ($list->brevo_list_id) {
            try {
                $payload = [
                    'name' => $this->buildRemoteListName($list),
                    // normalmente no hace falta tocar folderId al actualizar
                ];

                $response = $this->client()
                    ->put($this->url("/contacts/lists/{$list->brevo_list_id}"), $payload);

                if ($response->failed()) {
                    Log::warning('Brevo: error updating list name', [
                        'list_id'   => $list->id,
                        'brevo_id'  => $list->brevo_list_id,
                        'status'    => $response->status(),
                        'body'      => $response->body(),
                    ]);
                }
            } catch (Throwable $e) {
                Log::error('Brevo: exception updating list', [
                    'list_id'  => $list->id,
                    'brevo_id' => $list->brevo_list_id,
                    'error'    => $e->getMessage(),
                ]);
            }

            return $list;
        }

        // 3) Crear lista en Brevo con folderId obligatorio
        $payload = [
            'name'     => $this->buildRemoteListName($list),
            'folderId' => $list->brevo_folder_id, // aquí ya no es null gracias a ensureRemoteFolder
        ];

        try {
            $response = $this->client()
                ->post($this->url('/contacts/lists'), $payload);

            if ($response->failed()) {
                $body = $response->json();

                $list->brevo_sync_status = 'error';
                $list->brevo_sync_error  = $body['message'] ?? $response->body();
                $list->save();

                throw new \RuntimeException('Brevo error creating list: '.$response->body());
            }

            $data = $response->json();

            $list->brevo_list_id     = $data['id'] ?? null;
            $list->brevo_sync_status = 'ok';
            $list->brevo_sync_error  = null;
            $list->save();
        } catch (Throwable $e) {
            Log::error('Brevo: exception creating list', [
                'list_id' => $list->id,
                'error'   => $e->getMessage(),
            ]);

            $list->brevo_sync_status = 'error';
            $list->brevo_sync_error  = $e->getMessage();
            $list->save();

            throw $e;
        }

        return $list;
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
            if (!$user) {
                continue;
            }

            $payload = [
                'email'         => $email,
                'attributes'    => $this->mapUserAttributes($user),
                'listIds'       => [$list->brevo_list_id],
                'updateEnabled' => true,
            ];

            try {
                $response = $this->client()
                    ->post($this->url('/contacts'), $payload);

                if ($response->failed()) {
                    $body = $response->json();
                    $errors[] = [
                        'email'  => $email,
                        'stage'  => 'upsert',
                        'status' => $response->status(),
                        'error'  => $body['message'] ?? $response->body(),
                    ];
                } else {
                    $processed++;
                }
            } catch (Throwable $e) {
                $errors[] = [
                    'email'  => $email,
                    'stage'  => 'upsert',
                    'status' => null,
                    'error'  => $e->getMessage(),
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
            return;
        }

        $payload = [
            // Nombre que verá la clienta en Brevo
            'name' => sprintf(
                'ERP %s - Lista %s (#%d)',
                $list->company_id,
                $list->name,
                $list->id
            ),
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
