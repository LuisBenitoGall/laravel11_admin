<?php

namespace Database\Factories;

use App\Models\MarketingList;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MarketingListFactory extends Factory
{
    protected $model = MarketingList::class;

    public function definition(): array
    {
        $name = $this->faker->words(3, true);

        return [
            'name'               => $name,
            'slug'               => Str::slug($name),
            'company_id'         => 1,
            'owner_id'           => 1,
            'status'             => 1,
            'is_dynamic'         => false,
            'members_count'      => 0,
            'brevo_list_id'      => null,
            'brevo_folder_id'    => null,
            'brevo_synced_at'    => null,
            'brevo_sync_status'  => null,
            'brevo_sync_error'   => null,
            'created_by'         => 1,
            'updated_by'         => 1,
        ];
    }

    public function syncedWithBrevo(int $listId = 99, int $folderId = 55): static
    {
        return $this->state([
            'brevo_list_id'     => $listId,
            'brevo_folder_id'   => $folderId,
            'brevo_sync_status' => 'ok',
            'brevo_synced_at'   => now()->subHour(),
        ]);
    }
}
