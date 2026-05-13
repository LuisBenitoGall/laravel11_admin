<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\MarketingList;
use App\Services\Brevo\BrevoMarketingService;

// Listar las primeras listas
$lists = MarketingList::select('id','name','company_id','brevo_list_id','brevo_folder_id','brevo_sync_status','members_count')
    ->orderBy('id')
    ->limit(8)
    ->get();

echo "=== LISTAS DISPONIBLES ===\n";
foreach ($lists as $l) {
    printf(
        "ID:%d | %s | empresa:%d | brevo_id:%s | status:%s | miembros:%d\n",
        $l->id,
        $l->name,
        $l->company_id,
        $l->brevo_list_id ?? 'null',
        $l->brevo_sync_status ?? 'null',
        $l->members_count
    );
}

// Tomar la primera lista con miembros (o la primera sin más)
$list = $lists->where('members_count', '>', 0)->first() ?? $lists->first();

if (!$list) {
    echo "\nNo hay listas.\n";
    exit(1);
}

echo "\n=== PROBANDO CON LISTA ID:{$list->id} — \"{$list->name}\" ===\n";
echo "Estado antes: brevo_list_id={$list->brevo_list_id}, brevo_sync_status={$list->brevo_sync_status}\n\n";

$service = new BrevoMarketingService();

echo ">> ensureRemoteList...\n";
try {
    $service->ensureRemoteList($list);
    $list->refresh();
    echo "   brevo_list_id={$list->brevo_list_id}, brevo_folder_id={$list->brevo_folder_id}, status={$list->brevo_sync_status}\n";
    if ($list->brevo_sync_error) {
        echo "   ERROR: {$list->brevo_sync_error}\n";
    }
} catch (\Throwable $e) {
    echo "   EXCEPCION: " . $e->getMessage() . "\n";
}

echo "\n>> syncListMembers...\n";
try {
    $service->syncListMembers($list);
    $list->refresh();
    echo "   status={$list->brevo_sync_status}, synced_at={$list->brevo_synced_at}\n";
    if ($list->brevo_sync_error) {
        echo "   ERROR: {$list->brevo_sync_error}\n";
    }
} catch (\Throwable $e) {
    echo "   EXCEPCION: " . $e->getMessage() . "\n";
}

echo "\nDone.\n";
