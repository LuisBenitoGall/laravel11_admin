<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use App\Support\DataStandards\EmailNormalizer;
use App\Support\DataStandards\NifNormalizer;
use InvalidArgumentException;

/**
 * Resolución de perfil entregador (users / companies). No consulta CRM.
 *
 * @phpstan-type MatchRow array{id: int, label: string, nif: ?string, email: ?string}
 * @phpstan-type SearchResult array{
 *   status: 'none'|'match'|'conflict',
 *   type: 'company'|'user',
 *   companies: list<MatchRow>,
 *   users: list<MatchRow>
 * }
 */
class CustodyIntakeIdentityResolver
{
    /**
     * @return SearchResult
     */
    public function search(string $type, ?string $email, ?string $nif): array
    {
        if (! in_array($type, ['company', 'user'], true)) {
            throw new InvalidArgumentException('type debe ser company|user');
        }

        $emailNorm = EmailNormalizer::normalize($email);
        $nifNorm = NifNormalizer::normalize($nif);

        if ($emailNorm === null && $nifNorm === null) {
            throw new InvalidArgumentException('Se requiere email y/o NIF para buscar.');
        }

        $companies = $this->findCompanies($nifNorm);
        $users = $this->findUsers($emailNorm, $nifNorm);

        $chosen = $type === 'company' ? $companies : $users;
        $other = $type === 'company' ? $users : $companies;

        if (count($chosen) === 0 && count($other) === 0) {
            return [
                'status' => 'none',
                'type' => $type,
                'companies' => $companies,
                'users' => $users,
            ];
        }

        if (count($chosen) >= 1 && count($other) === 0) {
            return [
                'status' => 'match',
                'type' => $type,
                'companies' => $companies,
                'users' => $users,
            ];
        }

        // Match solo en el otro tipo, o en ambos → conflicto (admin elige)
        return [
            'status' => 'conflict',
            'type' => $type,
            'companies' => $companies,
            'users' => $users,
        ];
    }

    /**
     * @return list<array{id: int, label: string, nif: ?string, email: ?string}>
     */
    private function findCompanies(?string $nifNorm): array
    {
        if ($nifNorm === null) {
            return [];
        }

        return Company::query()
            ->whereNotNull('nif')
            ->where('nif', '!=', '')
            ->where(function ($q) use ($nifNorm) {
                $q->where('nif', $nifNorm)
                    ->orWhereRaw(
                        "REPLACE(REPLACE(UPPER(nif), '-', ''), ' ', '') = ?",
                        [$nifNorm]
                    );
            })
            ->orderBy('id')
            ->get(['id', 'name', 'tradename', 'nif'])
            ->map(fn (Company $c) => [
                'id' => (int) $c->id,
                'label' => (string) ($c->tradename ?: $c->name),
                'nif' => $c->nif,
                'email' => null,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: int, label: string, nif: ?string, email: ?string}>
     */
    private function findUsers(?string $emailNorm, ?string $nifNorm): array
    {
        if ($emailNorm === null && $nifNorm === null) {
            return [];
        }

        $q = User::query()->where(function ($w) use ($emailNorm, $nifNorm) {
            if ($emailNorm !== null) {
                $w->orWhere('email', $emailNorm);
            }
            if ($nifNorm !== null) {
                $w->orWhere('nif', $nifNorm)
                    ->orWhereRaw(
                        "REPLACE(REPLACE(UPPER(COALESCE(nif, '')), '-', ''), ' ', '') = ?",
                        [$nifNorm]
                    );
            }
        });

        return $q->orderBy('id')
            ->get(['id', 'name', 'surname', 'email', 'nif'])
            ->map(fn (User $u) => [
                'id' => (int) $u->id,
                'label' => trim(($u->name ?? '').' '.($u->surname ?? '')) ?: (string) $u->email,
                'nif' => $u->nif,
                'email' => $u->email,
            ])
            ->values()
            ->all();
    }
}
