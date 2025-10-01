<?php

namespace App\Traits\Models;

trait HasTranslations{
    public function allTranslationsFor(string $key): array{
        return parent::getAttribute($key);
    }

    public function getAttribute($key): mixed{
        return match (true) {
            method_exists($this, $key),
            !isset($this->translatable),
            !in_array($key, $this->translatable) => parent::getAttribute($key),
            default => $this->getTranslation($key),
        }   
    }

    private function getTranslation(string $key): ?string {
        $translations = (array) parent::getAttribute($key);

        return data_get(
            target: $translations,
            key: app()->getLocale(),        //Pasar también session locale
            default: data_get(target: $translations, key: app()->getFallbackLocale()),
        );
    }
}