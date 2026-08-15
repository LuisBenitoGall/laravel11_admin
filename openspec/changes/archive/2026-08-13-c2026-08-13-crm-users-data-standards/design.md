## Context

Users, crm_accounts y adjuntos (`phones` morph User, `user_emails`) tienen valores heterogéneos. Mutators parciales (`User` email/nif) y E.164 en `Phone` no cubren histórico ni import de forma unificada. El cliente exige canónico en BD (vistas + XLS) y un comando de producción. Prompt de entrada: `openspec/prompts/data_standards_crm_users_v1.md`.

`crm_contacts` no se normaliza (solo join a `user_id`). No se toca `companies` tenant ni el change de dedupe de import.

## Goals / Non-Goals

**Goals:**

- Una capa `App\Support\DataStandards\*` usada por HTTP, import y comando.
- Backfill idempotente con dry-run por defecto y `--apply` para escribir.
- Skip+reporte en UNIQUE y no parseable; skip fiscal en `isLinkedToMaster`.
- Export fechas `dd/mm/yyyy` sin re-Title-Case.

**Non-Goals:**

- Textos de `crm_contacts`, `user_addresses`, `companies`, tmp Dynamics, merge, índices únicos nuevos, UI de limpieza, flag `--orphans`.

## Decisions

1. **Capa compartida, no duplicar mutators**  
   Clases estáticas (o readonly helpers) por tipo: `EmailNormalizer`, `PhoneNormalizer` (libphonenumber, `default_region` ES; extraer la lógica de `Phone::toE164OrNull` y delegar), `NifNormalizer` (trim, quitar espacios/guiones, upper), `PersonNameNormalizer`, `AccountNameNormalizer` (trim/whitespace only), `TextCleanupNormalizer`, `DateNormalizer`, `SlugNormalizer` (`Str::slug`).  
   Mutators `User::setEmailAttribute` / `setNifAttribute` MUST llamar a esos helpers. `Phone::normalizeItems` MUST usar `PhoneNormalizer`.  
   Alternativa descartada: solo mutators Eloquent (el comando y el import bypassean o divergen).

2. **Comando** `php artisan data:normalize-crm-users`  
   - Default: dry-run (no escribe).  
   - `--apply` persiste.  
   - `--company=` opcional (int).  
   - `--chunk=` default 200.  
   Informe: stdout + archivo en `storage/logs/data-normalize-crm-users-{timestamp}.json` (o `.csv`) con filas `entity`, `id`, `field`, `before`, `after`, `action` (`would_update`|`updated`|`skip_collision`|`skip_unparseable`|`skip_linked_master`|`unchanged`). Sin tabla nueva de log.  
   Alternativa descartada: dry-run solo con flag `--dry-run` (peligroso si alguien lo lanza en prod sin flag).

3. **Universo**  
   - Cuentas: `crm_accounts.company_id` en scope.  
   - Users: IDs en `crm_contacts.user_id` de esas cuentas/empresa **o** `user_companies.company_id`. Unión.  
   - Phones: morph User de esos user IDs.  
   - `user_emails` de esos user IDs.  
   - Huérfanos: **no** se incluyen. Sin `--orphans` en v1.  
   - Sin `--company`: iterar empresas activas y aplicar la misma regla por tenant (un user en N empresas se procesa una vez por ejecución global, no N veces con reglas distintas: dedupe de user IDs al construir el set).

4. **Teléfono de cuenta**  
   Solo escalar `crm_accounts.main_phone` → E.164 o skip. No morph `phones` sobre CrmAccount.

5. **Person name**  
   `mb_strtolower` UTF-8 → Title Case por tokens (split espacios). Partículas (si el token no es el primero): `de`, `del`, `la`, `las`, `los`, `y`, `e`, `da`, `di`, `van`, `von` → minúsculas.  
   `Mc` / `O'`: si el token original (case-insensitive) empieza por `mc` o `o'`, preservar ese prefijo (`Mc`, `O'`) y Title Case el resto del token.  
   Token de 2–3 letras que en el original era todo MAYÚSCULAS: conservar MAYÚSCULAS (sigla). No detección agresiva de más siglas.

6. **NIF**  
   Quitar espacios y guiones, luego upper. Vacío → null/empty según columna nullable. Colisión UNIQUE → skip campo.

7. **Skip colisión**  
   Antes de UPDATE, comprobar si el valor canónico choca con otra fila (mismo unique). Si choca, no escribir ese campo; resto de campos de la fila sí pueden aplicarse. Phones: si el e164 canónico ya existe en otro phone del mismo owner, skip (no soft-delete del actual).

8. **Linked master**  
   No persistir `name`, `tradename`, `nif` en cuentas `isLinkedToMaster()`. `tax_id` se trata como fiscal si el modelo lo considera ligado a nif; **skip también `tax_id`** en enlazadas para no romper el candado por la puerta de atrás. Sí normalizar `main_email`, `main_phone`, `website`, billing/shipping, `normalized_name` solo si `name` no se toca: **no recalcular slug desde un name que no hemos recortado en BD**; si name tiene espacios y está locked, skip `normalized_name` también (evitar slug de un name sucio distinto del persistido). Si Implementation puede sluguear el name ya persistido (sucio) vs trimmed-in-memory: **slug desde el name persistido sin mutarlo** solo si el slug actual ≠ `Str::slug(trim(name persistido))` — wait, trim in slug doesn't change name. `Str::slug` already trims conceptually. Recalcular `normalized_name` from persisted name is OK even if name has extra spaces because slug collapses them. Decision: **sí recálculo de `normalized_name` desde name persistido** (slug) aunque name esté locked; no UPDATE de name.

9. **Fechas**  
   `DateNormalizer`: parsear con Carbon (formatos `Y-m-d`, `d/m/Y`, `d-m-Y`); inválido → skip; vacío → null si nullable. Persist `Y-m-d`. Export: columnas de fecha (`birthday` y las que marquen `export: 'date'` o `exportFormat: 'date'`) → `dd/mm/yyyy` en `TableExporter.cellToValue`. No Title Case en export.

10. **Import**  
    `ImportContactRowNormalizer` y bloque de phones/account en `importStore` delegan a DataStandards. Account name: trim only (no Title Case). company_nif → NifNormalizer.

11. **Alternativas descartadas**  
    - Índice único `(company_id, normalized_name)`: rompe altas manuales.  
    - Title Case de cuentas: vetado por negocio.  
    - Normalizar solo en export: no limpia filtros/dedupe.  
    - Morph phones en CrmAccount: fuera de inventario.

## Risks / Trade-offs

- **[Riesgo]** Colisiones masivas de email/nif tras lower/upper → **Mitigación**: skip por campo + informe; limpieza manual.  
- **[Riesgo]** Teléfonos basura no parseables quedan → **Mitigación**: informe; no borrar.  
- **[Riesgo]** User en varias empresas procesado en run global → **Mitigación**: set único de user IDs.  
- **[Riesgo]** `Phone::toE164OrNull` es protected → **Mitigación**: extraer a `PhoneNormalizer`; Phone delega.  
- **[Riesgo]** Comando largo en prod → **Mitigación**: chunks, `--company` piloto, ventana baja.  
- **[Trade-off]** Title Case no cubre todos los apellidos compuestos; lista de partículas cerrada.

## Migration Plan

- Sin migraciones de schema.  
- Despliegue: código + tests.  
- Prod: `data:normalize-crm-users` (dry-run) → revisar informe → `--company=` piloto `--apply` → global `--apply`.  
- Rollback de código: revertir deploy. Rollback de datos: no automático (informe `before` permite restauración manual puntual).

## Open Questions

- Cerradas: huérfanos no incluidos; `main_phone` solo escalar; partículas = lista del prompt.  
- `--orphans` no se implementa en v1 (si ops lo pide, change aparte).
