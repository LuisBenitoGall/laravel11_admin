<?php

namespace App\Support;

class CompanyContext {
    public function __construct(protected ?int $companyId = null) {}
    public function set(?int $id): void { $this->companyId = $id; }
    public function id(): ?int { return $this->companyId; }
}
