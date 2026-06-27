<?php

namespace App\Jobs;

use App\Services\Brevo\BrevoMarketingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

//Models:
use App\Models\MarketingList;
use App\Models\MarketingListUser;

class SyncMarketingListToBrevo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $listId;
    protected $triggeredBy;

    /**
     * Tiempo máximo de la Job (segundos).
     * Se ajusta en el constructor según el tamaño de la lista.
     */
    public $timeout = 300;

    public function __construct(int $listId, ?int $triggeredBy = null)
    {
        $this->listId      = $listId;
        $this->triggeredBy = $triggeredBy;

        $memberCount = MarketingListUser::query()
            ->where('marketing_list_id', $listId)
            ->where('status', 1)
            ->count();

        $this->timeout = max(300, min(3600, ($memberCount * 2) + 120));
    }

    public function handle(BrevoMarketingService $brevo)
    {
        $list = MarketingList::find($this->listId);

        if (!$list) {
            Log::warning('Brevo sync job: list not found', [
                'list_id' => $this->listId,
            ]);
            return;
        }

        try {
            // Misma lógica que tenías en el controlador
            $brevo->ensureRemoteList($list);
            $brevo->syncListMembers($list);
        } catch (\Throwable $e) {
            Log::error('Brevo sync job failed', [
                'list_id'      => $list->id,
                'triggered_by' => $this->triggeredBy,
                'error'        => $e->getMessage(),
            ]);

            // El propio servicio ya actualiza brevo_sync_status / brevo_sync_error
        }
    }

    public function failed(\Throwable $e): void
    {
        $list = MarketingList::find($this->listId);

        if (! $list) {
            return;
        }

        if ($list->brevo_sync_status === 'pending') {
            $list->forceFill([
                'brevo_sync_status' => 'error',
                'brevo_sync_error'  => $e->getMessage(),
            ])->save();
        }
    }
}
