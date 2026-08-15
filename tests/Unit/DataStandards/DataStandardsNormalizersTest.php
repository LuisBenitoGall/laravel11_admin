<?php

namespace Tests\Unit\DataStandards;

use App\Support\DataStandards\AccountNameNormalizer;
use App\Support\DataStandards\DateNormalizer;
use App\Support\DataStandards\EmailNormalizer;
use App\Support\DataStandards\NifNormalizer;
use App\Support\DataStandards\PersonNameNormalizer;
use App\Support\DataStandards\PhoneNormalizer;
use App\Support\DataStandards\SlugNormalizer;
use App\Support\DataStandards\TextCleanupNormalizer;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DataStandardsNormalizersTest extends TestCase
{
    #[Test]
    public function email_lowercases_and_trims(): void
    {
        $this->assertSame('a@b.com', EmailNormalizer::normalize('  A@B.com '));
        $this->assertNull(EmailNormalizer::normalize(''));
        $this->assertNull(EmailNormalizer::normalize(null));
    }

    #[Test]
    public function nif_strips_spaces_and_hyphens(): void
    {
        $this->assertSame('B12345678', NifNormalizer::normalize(' b-123 45678 '));
        $this->assertNull(NifNormalizer::normalize(''));
    }

    #[Test]
    public function account_name_preserves_casing(): void
    {
        $this->assertSame('ACME S.A.', AccountNameNormalizer::normalize("  ACME   S.A. \n"));
    }

    #[Test]
    public function person_name_title_case_particles_and_acronyms(): void
    {
        $this->assertSame('María de la Torre', PersonNameNormalizer::normalize('MARÍA DE LA TORRE'));
        $this->assertSame('McDonald', PersonNameNormalizer::normalize('mcdonald'));
        $this->assertSame("O'Neill", PersonNameNormalizer::normalize("o'neill"));
        $this->assertSame('Juan SL', PersonNameNormalizer::normalize('Juan SL'));
        $this->assertSame('', PersonNameNormalizer::normalize('  '));
    }

    #[Test]
    public function phone_to_e164_es_default(): void
    {
        $this->assertSame('+34600112233', PhoneNormalizer::toE164OrNull('600 112 233'));
        $this->assertNull(PhoneNormalizer::toE164OrNull('not-a-phone'));
        $this->assertNull(PhoneNormalizer::toE164OrNull(''));
    }

    #[Test]
    public function date_normalizes_common_formats(): void
    {
        $this->assertSame('2020-01-15', DateNormalizer::normalize('15/01/2020'));
        $this->assertSame('2020-01-15', DateNormalizer::normalize('2020-01-15'));
        $this->assertSame('2020-01-15', DateNormalizer::normalize('15-01-2020'));
        $this->assertNull(DateNormalizer::normalize('no-fecha'));
        $this->assertNull(DateNormalizer::normalize(''));
    }

    #[Test]
    public function slug_and_text_cleanup(): void
    {
        $this->assertSame('viuda-vila', SlugNormalizer::normalize('  Viuda Vila  '));
        $this->assertSame('hola mundo', TextCleanupNormalizer::normalize("hola\t\nmundo"));
    }
}
