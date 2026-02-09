# Design: Importación datos adicionales desde Dynamics (CSV)

## Context

- El proyecto ya dispone de un flujo de importación en dos fases para contactos CRM: `ImportCrmContacts` (CSV → `crm_contacts_tmp`) y `PromoteCrmContacts` (tmp → users, crm_contacts, etc.), con configuración en `config/crm_import.php`. Se reutiliza el mismo patrón para no duplicar arquitectura.
- El CSV de origen es `storage/app/import/contacts_all.csv`, con cabeceras: email, name, surname, cost_center, department, email2, email3, nif, position, phone1, phone2, phone3, contact_type, business_type. La primera fila son cabeceras; el delimitador se detectará (tab o coma).
- Los tipos de contacto vienen definidos en `HasContactTypes::typesMap()` (clave máx. 4 caracteres, valor i18n en es.json/en.json). Los tipos de negocio en `HasBusinessTypes::typesMap()` (índice numérico, valor literal). Las tablas `phones` (polimórfica, User), `user_emails`, `user_cost_centers` y `cost_centers` ya existen. La empresa de destino se fija por parámetro del comando (`--company=1`) con fallback a 1.

## Goals / Non-Goals

**Goals:**

- Crear tabla temporal `crm_contacts_extra_tmp` y modelo `CrmContactExtraTmp` exclusivos para este CSV.
- Comando `ImportCrmContactsExtra`: leer CSV, mapear columnas a la temporal, soportar `--dry-run`.
- Comando `PromoteCrmContactsExtra`: por cada fila de la temporal, resolver/crear User por email; resolver/crear CrmContact; añadir teléfonos (E.164), emails adicionales, centros de coste; mapear contact_type y business_type con posibilidad de añadir nuevos valores en los concerns y en i18n.
- Normalización de teléfonos a E.164 con giggsey/libphonenumber-for-php; comparación por e164 en phones para no duplicar.
- Unicidad en user_cost_centers (company_id, user_id, cost_center_id).

**Non-Goals:**

- No modificar el flujo ni la tabla `crm_contacts_tmp` existente. No importar cuentas (crm_accounts). No tocar otros comandos de importación.

## Decisions

### D1: Tabla temporal exclusiva

- Crear `crm_contacts_extra_tmp` con columnas 1:1 con las cabeceras del CSV (email, name, surname, cost_center, department, email2, email3, nif, position, phone1, phone2, phone3, contact_type, business_type), todas nullable string/text según tamaño esperado. Evita mezclar con la importación clásica y permite evolucionar este CSV sin afectar la otra tmp.
- **Alternativa:** Reutilizar `crm_contacts_tmp` añadiendo columnas; descartada por decisión del usuario (tabla nueva exclusiva).

### D2: Configuración del CSV

- Añadir entrada `contacts_all` o `contacts_extra` en `config/crm_import.php`: `file` => `storage_path('app/import/contacts_all.csv')`, `model` => `CrmContactExtraTmp::class`, y `mapping` cabecera CSV → columna BD. El comando Import lee esta config igual que `ImportCrmContacts`.
- **Alternativa:** Path y mapeo hardcodeados en el comando; descartada para mantener consistencia con el resto de imports.

### D3: Mapeo contact_type (HasContactTypes)

- Para cada valor de la columna `contact_type` del CSV: normalizar (trim, sin acentos, minúsculas) y comparar con las traducciones existentes de `typesMap()` en es.json. Si hay coincidencia razonable (normalizada), usar esa clave (índice). Si no hay coincidencia: generar nueva clave de máx. 4 caracteres no usada (ej. abreviatura o sufijo numérico), añadirla a `typesMap()` y añadir la cadena en es.json y en.json; persistir los cambios en los archivos (o en runtime solo para la ejecución). Se documenta que la comparación es "reasonably" (ignorar acentos, mayúsculas) para evitar falsos negativos.
- **Alternativa:** Rechazar filas con contact_type desconocido; descartada para no perder datos y permitir enriquecer el catálogo.

### D4: Mapeo business_type (HasBusinessTypes)

- El array es numérico (clave int, valor string). Comparar el valor del CSV (normalizado) con los literales de `typesMap()`. Si coincide, usar la clave numérica. Si no: añadir nuevo índice (siguiente entero disponible) y literal al array en el concern; el concern es código PHP, por lo que "añadir" implica editar el archivo o tener un mecanismo de extensión (p. ej. merge con config). Decisión de implementación: en Promote, si no hay coincidencia, se puede usar un valor por defecto (ej. null o 1) y registrar en log, o extender el array en un archivo de config que el concern lea. Para simplicidad inicial: si no coincide, asignar null o el primer id disponible y loguear; la extensión manual del array en HasBusinessTypes queda como mejora posterior si se desea persistir nuevos tipos desde el CSV.
- **Alternativa:** Siempre extender HasBusinessTypes en disco desde el comando; posible pero más invasivo (escribir en archivos PHP desde Artisan).

### D5: Teléfonos y E.164

- Usar `giggsey/libphonenumber-for-php`: parsear con región por defecto (ej. ES) si no hay prefijo, intentar con + si viene el prefijo, obtener formato E.164. Si el número no es válido, no insertar en phones y opcionalmente loguear. Comprobar existencia por (phoneable_type = User, phoneable_id = user->id, e164 = valor_normalizado) antes de insertar.
- **Alternativa:** Guardar número tal cual; descartada por requisito de normalización.

### D6: user_emails y centros de coste

- **user_emails:** Comprobar por (user_id, email) antes de insertar; tabla con user_id, email, observations (nullable), timestamps.
- **cost_centers:** Buscar por slug (slug del cost_center del CSV) y company_id. Si no existe, crear con company_id, name (= valor CSV), slug, status=1. Luego insertar en user_cost_centers (company_id, user_id, cost_center_id) si no existe la terna; clave única o comprobar antes de insertar.

### D7: Empresa (company_id)

- Parámetro del comando `--company=1`; si no se proporciona o no se puede resolver, usar `$currentCompanyId = 1` como fallback para no bloquear ejecución en CLI.

## Risks / Trade-offs

- **[Riesgo]** Valores nuevos de contact_type o business_type requieren editar código o i18n desde el comando. → **Mitigación:** Comparación "reasonably" amplia para reutilizar claves existentes; para contact_type, implementar auto-añadir a typesMap + es.json/en.json desde el comando; para business_type, valor por defecto o extensión vía config si se implementa en una segunda iteración.
- **[Riesgo]** CSV con codificación o delimitador distinto. → **Mitigación:** Detección de delimitador como en ImportCrmContacts; asumir UTF-8; documentar en tasks.
- **[Trade-off]** Promote procesa fila a fila; para muchos registros puede ser lento. → Aceptable; chunking por lotes como en PromoteCrmContacts si hace falta.

## Migration Plan

- Ejecutar migración que crea `crm_contacts_extra_tmp`. Desplegar comandos y config. Ejecutar `crm:import-contacts-extra` y luego `crm:promote-contacts-extra --company=1`. Rollback: eliminar migración (down), quitar comandos y entrada de config.

## Open Questions

- Ninguna pendiente; decisiones de mapeo y tabla quedan fijadas por el proposal y este design.
