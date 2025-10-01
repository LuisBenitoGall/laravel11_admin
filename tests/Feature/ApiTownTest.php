<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Country;
use App\Models\Province;
use App\Models\Town;

class ApiTownTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_town_with_province_and_country_ids()
    {
        // Arrange: create country, province and town
        $country = Country::factory()->create(['name' => 'Testland']);
        $province = Province::factory()->create(['name' => 'Test Province', 'country_id' => $country->id]);
        $town = Town::factory()->create(['name' => 'Test Town', 'province_id' => $province->id]);

        // Act: call endpoint (no auth required for this route)
        $response = $this->getJson("/api/town/{$town->id}");

        // Assert
        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $town->id,
                     'province_id' => $province->id,
                     'country_id' => $country->id,
                 ]);
    }
}
