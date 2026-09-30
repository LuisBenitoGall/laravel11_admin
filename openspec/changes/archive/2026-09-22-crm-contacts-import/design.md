# Design: Importación de contactos CRM (XLS/XLSX)

## Context

- El listado de contactos está en `CrmContactController::index`; las acciones del layout se construyen según permisos (`crm-contacts.create`, etc.). Las rutas actuales son GET `/crm-contacts`, `/crm-contacts/filtered-data`, `/crm-contacts/new-contacts`, DELETE `/crm-contacts/{contact}`.
- Los contactos CRM se almacenan en `crm_contacts` (relación con `users` y opcionalmente `crm_accounts`). Los usuarios se identifican por `email` o `nif` para evitar duplicados; las cuentas por `tax_id`. La empresa en sesión (`CompanyContext`) define el `company_id` de los contactos.
- No existe hoy un flujo de importación masiva; este cambio introduce uno nuevo con validación en cliente y servidor, template descargable y feedback de filas no procesadas.

## Goals / Non-Goals

**Goals:**

- Añadir acción "Importar contactos" en el listado (solo con permiso `crm-contacts.create`), rutas GET/POST para formulario y envío, vista Import con texto explicativo, enlace al template, input file y validación JS (formato .xls/.xlsx, 2 MB, 1000 filas).
- Procesar el archivo en backend: normalizar datos, crear/obtener user (por email/nif), crear/obtener crm_account (por tax_id), crear crm_contact si no existe. Mostrar progreso durante el proceso y al final éxito/error más listado de filas no procesadas.

**Non-Goals:**

- No importar a otras entidades (solo users + crm_accounts + crm_contacts). No soportar CSV u otros formatos en esta fase. No permitir elegir empresa distinta de la de sesión.

## Decisions

### D1: Librería Excel y formato

- Usar **PhpSpreadsheet** (o la que ya esté en el proyecto) para leer .xls y .xlsx. Validar en backend por extensión y por contenido (MIME / cabecera) para rechazar archivos no Excel. Alternativa considerada: solo .xlsx y SimpleXLSX; se descarta para no excluir .xls.

### D2: Ubicación del template

- Alojar el template en una carpeta reutilizable para futuros imports (p. ej. `storage/app/templates/` con symlink o copia a `public/` para descarga, o directamente `public/templates/contactos-import.xls`). Decisión concreta: `storage/app/templates/` y una ruta nombrada que sirva el archivo (controller que lee de Storage y devuelve descarga) para no exponer rutas físicas y poder controlar permisos. Alternativa: `public/downloads/templates/contactos-import.xls`; se prefiere ruta controlada por backend para mantener un solo lugar de templates.

### D3: Límites y validación

- Límites: **2 MB** de tamaño y **1000 filas** (sin contar cabecera). Validación en JS (formato permitido, tamaño) para UX; validación en backend obligatoria (reglas de validación Laravel + comprobación de filas tras leer el archivo). Si el archivo supera filas o tamaño, rechazar antes de procesar y devolver mensaje claro.

### D4: Normalización de datos

- Aplicar antes de buscar/crear: trim de espacios, normalización de cadenas (p. ej. minúsculas donde aplique para emails), y saneamiento de caracteres conflictivos (saltos de línea, tabuladores dentro de celdas, etc.). Definir reglas en un único lugar (helper o clase) reutilizable.

### D5: Orden y unicidad User / Account / Contact

- Por cada fila: (1) Buscar o crear **User** por email si existe, si no por nif; si no hay email ni nif, crear siempre (permite duplicados nombre/apellidos). Campos: name (required), surname, email, nif, isAdmin false, status true. (2) Si hay datos de empresa, buscar o crear **CrmAccount** por tax_id (company_nif); mapeo de columnas a name, normalized_name (slug de name), tax_id, billing_*, main_phone, main_email. (3) Buscar **CrmContact** por user_id (y company_id); si no existe, crear con company_id de sesión, user_id, crm_account_id si hay cuenta, position, department, observations.
- Las filas que fallen (validación de fila, duplicado no permitido, excepción) se acumulan y se devuelven en la respuesta para mostrarlas en la vista.

### D6: Respuesta POST y feedback en UI

- Tras procesar, el backend devuelve (Inertia o JSON según patrón del proyecto) un payload con: éxito/error global, total procesados, total fallidos, y lista de filas no procesadas (número de fila y motivo o datos de la fila). La vista Import muestra durante el envío un spinner o barra de progreso con texto tranquilizador; al final muestra mensaje de éxito o fracaso y, si hay filas fallidas, el listado indicando que no se pudieron procesar.

## Risks / Trade-offs

- **[Riesgo]** Archivos muy grandes o muchos usuarios importando a la vez pueden sobrecargar el servidor. → **Mitigación**: Límite 2 MB y 1000 filas; validación en backend; opcionalmente cola o chunking en futuras iteraciones.
- **[Riesgo]** Duplicados si el mismo email/nif aparece en el archivo con datos distintos. → **Mitigación**: Primera ocurrencia gana (buscar antes de crear); filas posteriores con mismo email/nif pueden considerarse “no procesadas” o actualización según regla de negocio (spec: “no exista el email o nif” → no crear usuario duplicado; la fila se considera fallida o se omite).
- **[Trade-off]** Progreso “real” durante el POST requeriría chunking o streaming; para esta versión un único POST con spinner/barra indeterminada y mensaje al terminar es aceptable.

## Migration Plan

- No hay migraciones de BD; solo código nuevo (rutas, controller, vista, template, i18n). Despliegue: subir template a `storage/app/templates/`, desplegar código y comprobar permiso `crm-contacts.create` en la ruta de importación. Rollback: eliminar rutas y acción si fuera necesario.

## Open Questions

- Ninguna pendiente; límites y permisos quedan fijados por el proposal y este design.
