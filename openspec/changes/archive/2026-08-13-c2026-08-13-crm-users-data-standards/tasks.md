## 1. Capa DataStandards

- [x] 1.1 Crear `app/Support/DataStandards/` con Email, Nif, TextCleanup, Date, Slug, AccountName (trim/whitespace, sin casing)
- [x] 1.2 Implementar `PhoneNormalizer` (E.164, default region ES) y hacer que `Phone` delegue (`toE164OrNull` / `normalizeItems`)
- [x] 1.3 Implementar `PersonNameNormalizer` (Title Case UTF-8, partículas, Mc/O', siglas 2–3 letras)
- [x] 1.4 Tests unitarios de cada normalizer (casos ES + skip/null/vacío)

## 2. Escritura hacia delante

- [x] 2.1 Mutators `User` email/nif delegan a DataStandards; name/surname/birthday usan la misma capa en create/update (FormRequest o modelo)
- [x] 2.2 Create/update `CrmAccount` aplica AccountName, Nif/tax_id, email, main_phone, textos, country_code, `normalized_name`; respeta candado `isLinkedToMaster`
- [x] 2.3 `importStore` e `ImportContactRowNormalizer` delegan a DataStandards (email, nif, phones, company name trim, company_nif)
- [x] 2.4 Feature: alta manual e import persisten el mismo canónico para email/NIF/teléfono/nombre

## 3. Comando de backfill

- [x] 3.1 Comando `data:normalize-crm-users` dry-run por defecto, `--apply`, `--company=`, `--chunk=200`, informe stdout + `storage/logs/`
- [x] 3.2 Universo: cuentas por `company_id`; users por `crm_contacts.user_id` ∪ `user_companies`; phones y user_emails de esos users; excluir huérfanos; deduplicar users en run global
- [x] 3.3 Skip+reporte: colisión UNIQUE email/nif, e164 duplicado en mismo owner, no parseable phone/fecha, campos fiscales si `isLinkedToMaster`; no borrar ni merge
- [x] 3.4 Recalcular `normalized_name` con `Str::slug(name persistido)` incluso en cuentas enlazadas; no mutar name locked
- [x] 3.5 Feature comando: dry-run no escribe; apply escribe; segunda apply ≈ 0; skip colisión; skip unparseable; `--company` no cruza; skip maestro

## 4. Export

- [x] 4.1 `TableExporter` (o `exportValue` de columnas) formatea fechas `dd/mm/yyyy`; no reaplicar Title Case
- [x] 4.2 Verificar listados User/CrmContact que exportan `birthday` usan el formato
  - Nota: Index User/CrmContact actuales no incluyen columna `birthday`; `TableExporter` formatea `key === 'birthday'` o `export`/`exportFormat === 'date'`.

## 5. Verificación

- [x] 5.1 Ejecutar unit + feature de este change y comprobar que pasan
- [x] 5.2 `/opsx-verify` (o checklist vs spec/design/tasks) sin hallazgos bloqueantes
  - Checklist: capa DataStandards; escritura User/CrmAccount/import; comando dry-run/apply/skip/scope; export fechas; tests 12/12 OK. Hand-off formal a agente 30 si se desea auditoría adicional.
