## Context

`CrmContactController@importStore` descarta la fila si `$name === ''` con `__('import_sin_nombre')` (“Fila sin nombre.”), ~L1138–1143, **después** de `ImportContactRowNormalizer::normalizeRow`. Un Excel real dejó 119 filas fuera; 62 tenían `user_email` o teléfono de persona; 57 solo datos de empresa (deben seguir fallando). Prompt: `openspec/prompts/crm_contacts_import_identity_gate.md`.

Matching de User sigue email → nif; create asigna `$user->name = $name`. Mutator `User::setNameAttribute` pasa por `PersonNameNormalizer` (`Anónimo` → `Anónimo`, no se deforma). Validez de teléfono de import: `rowHasAtLeastOneValidPhoneNumber` / `Phone::toE164OrNull`, región ES.

## Goals / Non-Goals

**Goals:**

- Portero: `name` **o** `user_email` **o** teléfono persona E.164/ES.
- Alta sin nombre: `users.name = Anónimo` solo en create.
- Fallo: `failed_rows` + i18n nuevo; condiciones de la vista actualizadas.
- Tests Feature del harness de import existente.

**Non-Goals:**

- `company_email` / `company_phone` como identidad; match User por teléfono; NIF solo; Artisan/Dynamics; resolución CrmAccount; change stale `crm-contacts-import`; migraciones; UI nueva.

## Decisions

1. **Orden**  
   Normalizar fila → evaluar portero sobre valores de fila (name vacío = `''` post-normalizer; email no vacío; `rowHasAtLeastOneValidPhoneNumber` sobre `user_phone1`/`user_phone2`) → si falla, `failed_rows` y `continue` **antes** de la transacción. Si pasa, matching User igual que hoy → create con `name` de fila o `'Anónimo'` si name de fila `=== ''`.

2. **El portero no usa el placeholder**  
   Se evalúa el `name` de la fila, no el valor a persistir. `Anónimo` solo se asigna al `new User()`.

3. **User existente**  
   Si hay match por email/NIF, no asignar name (el código actual ya no muta el User encontrado). MUST NOT escribir `Anónimo` ni vaciar.

4. **Teléfono**  
   Reutilizar `rowHasAtLeastOneValidPhoneNumber`; no nueva regla. Texto no parseable no abre el portero. No `User::where` por e164.

5. **company_***  
   No entran en el if del portero. Las 57 filas solo-empresa siguen en `failed_rows`.

6. **i18n**  
   Nueva clave p. ej. `import_sin_identidad` (Architecture fija el id; Implementation no reutiliza el sentido de `import_sin_nombre` como único motivo). Ampliar `import_condiciones_texto` en `lang/es.json`. `lang/en.json` no tiene hoy claves `import_*`: añadir las mismas claves en inglés para no dejar hueco si el locale es `en`. Vista `Import.jsx` sigue con `__('import_condiciones_texto')`; el motivo sale del backend en `failed_rows.reason`.

7. **PersonNameNormalizer**  
   No hace falta excepción especial: `Anónimo` es estable bajo Title Case. No asignar cadena vacía (NOT NULL).

8. **Change nuevo**  
   No continuar `openspec/changes/crm-contacts-import`. Capability nueva `crm-contacts-import-row-identity`.

9. **Alternativas descartadas**  
   - Contar company_email/phone (decisión A del explore).  
   - Match por teléfono (reimport duplicaría Users a propósito si no hay email/NIF).  
   - NIF solo como portero.  
   - Placeholder i18n en BD (`__()`): el valor de negocio es el literal `Anónimo`.

## Risks / Trade-offs

- **[Riesgo]** 57 filas solo-empresa seguirán fallando → **Mitigación**: esperado; copy de condiciones lo deja claro.  
- **[Riesgo]** Reimport sin email/NIF con mismo teléfono crea otro User `Anónimo` → **Mitigación**: NonGoal explícito (no match por teléfono).  
- **[Riesgo]** `import_sin_nombre` queda huérfana → **Mitigación**: dejar de usarla en este corte; no borrar la clave salvo que no tenga otros usos (grep en apply).  
- **[Trade-off]** `en.json` incompleto respecto a import: se añaden al menos las claves tocadas.

## Migration Plan

- Sin schema. Deploy de código + i18n. Rollback: revertir el if del portero.  
- Datos ya descartados no se recuperan solos: reimportar el Excel.

## Open Questions

Ninguna. Cerradas en explore (columnas A, `Anónimo`, NIF solo no, sin match teléfono, solo UI Excel).
