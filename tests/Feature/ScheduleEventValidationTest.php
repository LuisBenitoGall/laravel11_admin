<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Module;
use App\Models\Schedule;
use App\Models\ScheduleEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ScheduleEventValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;
    private Schedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedModulesAndRole();
        $this->user = User::factory()->create();
        $this->user->assignRole('Super Admin');
        $this->company = Company::factory()->create(['status' => 1]);
        $this->user->companies()->attach($this->company->id, ['position' => 'test']);
        $this->schedule = Schedule::create([
            'company_id' => $this->company->id,
            'owner_id' => $this->user->id,
            'name' => 'Test Schedule',
            'color' => '#3788d8',
            'status' => true,
        ]);
    }

    private function seedModulesAndRole(): void
    {
        Module::firstOrCreate(['slug' => 'schedule'], [
            'name' => 'schedule',
            'label' => 'schedule',
            'color' => '#3788d8',
            'icon' => 'calendar',
            'level' => '2',
            'translations' => serialize(['es' => 'Agenda']),
            'status' => 1,
            'active' => true,
        ]);
        Role::firstOrCreate(['name' => 'Super Admin']);
    }

    /** @test */
    public function backend_rejects_event_when_ends_at_is_before_starts_at(): void
    {
        $url = route('schedule-events.store', $this->schedule);
        $startsAt = now()->addDays(2)->setTime(10, 0, 0);
        $endsAt = now()->addDays(2)->setTime(9, 0, 0); // 1 hour before start

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->company->id])
            ->postJson($url, [
                'title' => 'Test Event',
                'starts_at' => $startsAt->toIso8601String(),
                'ends_at' => $endsAt->toIso8601String(),
                'all_day' => false,
                'description' => null,
                'location' => null,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ends_at']);
    }

    /** @test */
    public function backend_rejects_event_when_duration_is_less_than_15_minutes_for_timed_events(): void
    {
        $url = route('schedule-events.store', $this->schedule);
        $startsAt = now()->addDays(2)->setTime(10, 0, 0);
        $endsAt = now()->addDays(2)->setTime(10, 10, 0); // only 10 minutes later

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->company->id])
            ->postJson($url, [
                'title' => 'Test Event',
                'starts_at' => $startsAt->toIso8601String(),
                'ends_at' => $endsAt->toIso8601String(),
                'all_day' => false,
                'description' => null,
                'location' => null,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ends_at']);
    }

    /** @test */
    public function backend_accepts_event_with_valid_dates_and_at_least_15_minutes_duration(): void
    {
        $url = route('schedule-events.store', $this->schedule);
        $startsAt = now()->addDays(2)->setTime(10, 0, 0);
        $endsAt = now()->addDays(2)->setTime(10, 30, 0); // 30 minutes later

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->company->id])
            ->postJson($url, [
                'title' => 'Valid Event',
                'starts_at' => $startsAt->toIso8601String(),
                'ends_at' => $endsAt->toIso8601String(),
                'all_day' => false,
                'description' => null,
                'location' => null,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertDatabaseHas('schedule_events', ['title' => 'Valid Event']);
    }

    /** @test */
    public function backend_accepts_all_day_event_with_same_day_start_and_end(): void
    {
        $url = route('schedule-events.store', $this->schedule);
        $date = now()->addDays(2)->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->company->id])
            ->postJson($url, [
                'title' => 'All Day Event',
                'starts_at' => $date . 'T00:00:00+00:00',
                'ends_at' => $date . 'T23:59:59+00:00',
                'all_day' => true,
                'description' => null,
                'location' => null,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertDatabaseHas('schedule_events', ['title' => 'All Day Event']);
    }

    /** @test */
    public function update_rejects_event_when_ends_at_is_before_starts_at(): void
    {
        $event = ScheduleEvent::create([
            'company_id' => $this->company->id,
            'schedule_id' => $this->schedule->id,
            'created_by' => $this->user->id,
            'title' => 'Existing Event',
            'starts_at' => now()->addDays(3)->setTime(14, 0, 0),
            'ends_at' => now()->addDays(3)->setTime(15, 0, 0),
            'all_day' => false,
            'status' => 'active',
        ]);

        $url = route('schedule-events.update', $event);
        $startsAt = now()->addDays(3)->setTime(14, 0, 0);
        $endsAt = now()->addDays(3)->setTime(13, 0, 0);

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->company->id])
            ->putJson($url, [
                'title' => 'Updated Event',
                'starts_at' => $startsAt->toIso8601String(),
                'ends_at' => $endsAt->toIso8601String(),
                'all_day' => false,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ends_at']);
    }

    /** @test */
    public function update_rejects_event_when_duration_less_than_15_minutes(): void
    {
        $event = ScheduleEvent::create([
            'company_id' => $this->company->id,
            'schedule_id' => $this->schedule->id,
            'created_by' => $this->user->id,
            'title' => 'Existing Event',
            'starts_at' => now()->addDays(3)->setTime(14, 0, 0),
            'ends_at' => now()->addDays(3)->setTime(15, 0, 0),
            'all_day' => false,
            'status' => 'active',
        ]);

        $url = route('schedule-events.update', $event);
        $startsAt = now()->addDays(3)->setTime(14, 0, 0);
        $endsAt = now()->addDays(3)->setTime(14, 5, 0); // 5 minutes

        $response = $this->actingAs($this->user)
            ->withSession(['currentCompany' => $this->company->id])
            ->putJson($url, [
                'title' => 'Updated Event',
                'starts_at' => $startsAt->toIso8601String(),
                'ends_at' => $endsAt->toIso8601String(),
                'all_day' => false,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ends_at']);
    }
}
