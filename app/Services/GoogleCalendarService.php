<?php

namespace App\Services;

use App\Models\GoogleCalendarIntegration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

/**
 * Cliente para Google Calendar API v3.
 * Refresca el access_token si está expirado y expone métodos para listar, crear, actualizar y eliminar eventos.
 */
class GoogleCalendarService
{
    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

    public function __construct(
        private GoogleCalendarIntegration $integration
    ) {}

    /**
     * Asegura que el access_token sea válido (refresca si está expirado) y devuelve el token.
     */
    public function getValidAccessToken(): string
    {
        $expiresAt = $this->integration->token_expires_at;
        $buffer = 300; // 5 min de margen
        if ($expiresAt && $expiresAt->getTimestamp() - $buffer <= time()) {
            $this->refreshAccessToken();
        }
        return $this->integration->access_token;
    }

    /**
     * Refresca el access_token usando refresh_token y actualiza la integración.
     */
    public function refreshAccessToken(): void
    {
        $response = Http::asForm()->post(self::TOKEN_URL, [
            'client_id'     => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token'  => $this->integration->refresh_token,
            'grant_type'    => 'refresh_token',
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Google Calendar: no se pudo refrescar el token. ' . $response->body());
        }

        $data = $response->json();
        $expiresIn = (int) ($data['expires_in'] ?? 3600);
        $this->integration->access_token = $data['access_token'];
        $this->integration->token_expires_at = Carbon::now()->addSeconds($expiresIn);
        $this->integration->save();
    }

    /**
     * Lista eventos de un calendario en un rango de fechas.
     * timeMin y timeMax en RFC3339.
     *
     * @return array<int, array> items con id, summary, description, start, end, updated, etc.
     */
    public function listEvents(string $calendarId, string $timeMin, string $timeMax): array
    {
        $token = $this->getValidAccessToken();
        $url = self::CALENDAR_API . '/calendars/' . urlencode($calendarId) . '/events';
        $response = Http::withToken($token)->get($url, [
            'timeMin'      => $timeMin,
            'timeMax'      => $timeMax,
            'singleEvents' => 'true',
            'orderBy'      => 'startTime',
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Google Calendar list events failed: ' . $response->body());
        }

        $data = $response->json();
        return $data['items'] ?? [];
    }

    /**
     * Crea un evento en el calendario. Devuelve el id del evento creado.
     *
     * @param array<string, mixed> $eventData summary, description?, start (dateTime + timeZone), end (dateTime + timeZone)
     */
    public function createEvent(string $calendarId, array $eventData): string
    {
        $token = $this->getValidAccessToken();
        $url = self::CALENDAR_API . '/calendars/' . urlencode($calendarId) . '/events';
        $response = Http::withToken($token)->post($url, $eventData);

        if (! $response->successful()) {
            throw new \RuntimeException('Google Calendar create event failed: ' . $response->body());
        }

        $data = $response->json();
        return (string) ($data['id'] ?? '');
    }

    /**
     * Actualiza un evento por id.
     *
     * @param array<string, mixed> $eventData campos a actualizar (summary, start, end, etc.)
     */
    public function updateEvent(string $calendarId, string $eventId, array $eventData): void
    {
        $token = $this->getValidAccessToken();
        $url = self::CALENDAR_API . '/calendars/' . urlencode($calendarId) . '/events/' . urlencode($eventId);
        $response = Http::withToken($token)->put($url, $eventData);

        if (! $response->successful()) {
            throw new \RuntimeException('Google Calendar update event failed: ' . $response->body());
        }
    }

    /**
     * Elimina un evento por id.
     */
    public function deleteEvent(string $calendarId, string $eventId): void
    {
        $token = $this->getValidAccessToken();
        $url = self::CALENDAR_API . '/calendars/' . urlencode($calendarId) . '/events/' . urlencode($eventId);
        $response = Http::withToken($token)->delete($url);

        if (! $response->successful() && $response->status() !== 404) {
            throw new \RuntimeException('Google Calendar delete event failed: ' . $response->body());
        }
    }

    public function getIntegration(): GoogleCalendarIntegration
    {
        return $this->integration;
    }
}
