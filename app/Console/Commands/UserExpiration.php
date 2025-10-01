<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

//Models:
use App\Models\User;
use App\Models\UserError;

class UserExpiration extends Command{
    protected $signature = 'user:expiration {--dry-run}';
    protected $description = 'Desactiva usuarios según tu lógica (403, inactividad, etc.)';

    public function handle(): int{
        $limit = (int) config('constants.ERROR_MAX_403_', 5);

        // Candidatos: usuarios con >= N errores 403 (no soft-deleted)
        $rows = UserError::select('user_id', DB::raw('COUNT(*) as total'))
            ->where('error', 403)
            ->whereNull('deleted_at')
            ->groupBy('user_id')
            ->having('total', '>=', $limit)
            ->get();

        if ($rows->isEmpty()) {
            $this->info('No hay usuarios que superen el umbral.');
            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            foreach ($rows as $r) {
                $this->line("User #{$r->user_id} superó el umbral ({$r->total} ≥ {$limit})");
            }
            return self::SUCCESS;
        }

        $deactivated = 0;

        DB::transaction(function () use ($rows, &$deactivated) {
            foreach ($rows as $r) {
                /** @var User|null $user */
                $user = User::find($r->user_id);
                if (!$user) continue;

                // No tocar superadmin, y si ya está inactivo pasa
                if (method_exists($user, 'hasRole') && $user->hasRole('Super Admin')) continue;
                if ((int)$user->status === 0) continue;

                // Desactivar acceso
                $user->update(['status' => 0, 'isAdmin' => false]);
                $deactivated++;

                // Cerrar sesiones si el driver es database
                if (config('session.driver') === 'database') {
                    DB::table('sessions')->where('user_id', $user->id)->delete();
                }
            }
        });

        $this->info("Usuarios desactivados: {$deactivated}");
        return self::SUCCESS;
    }
}
