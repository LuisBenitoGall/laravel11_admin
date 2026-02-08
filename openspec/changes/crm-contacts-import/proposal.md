# Change: Módulo de importación de contactos (XLS/XLSX)

## Why

Permitir cargar contactos CRM de forma masiva desde archivos Excel (.xls y .xlsx), reduciendo la carga manual cuando se incorporan muchos contactos con una estructura repetible. La empresa en sesión y el permiso existente de creación de contactos se reutilizan para controlar quién puede importar.

## What Changes

- **Vista admin/crm-contacts**: Nuevo action "Importar contactos" (i18n `contactos_importar`, icono `la-file-import`) que enlaza a la vista de importación. Solo visible para usuarios con permiso `crm-contacts.create`.
- **Rutas**: GET `crm-contacts/import` (mostrar formulario) y POST para guardar la importación. Ambas protegidas por permiso `crm-contacts.create`; si el usuario no tiene permiso, no se muestra el CTA y el acceso a la vista se bloquea.
- **Vista Import**: Página con texto explicativo (formato .xls/.xlsx, peso máximo 2 MB, máximo 1000 filas), enlace de descarga al template, formulario con input file y validación en JS (formato y tamaño). Durante el proceso se muestra feedback (spinner o barra de progreso). Al final, mensaje de éxito o error y listado de filas no procesadas si las hubiera.
- **Template Excel**: Archivo template con columnas name, surname, user_email, user_nif, position, department, observations, company, company_nif, company_city, company_postal_code, company_street, company_phone, company_email. Ubicación en carpeta reutilizable para futuros templates similares.
- **Backend**: Método `CrmContactController@import` (GET, alineado con convenciones del controller) y `CrmContactController@importStore` (POST) con validación de archivo (formato, peso, límite de filas). Proceso: normalizar datos, crear/obtener user (por email/nif), crear/obtener crm_account (por tax_id), crear crm_contact si no existe (user_id + company_id de sesión). Contactos sin email ni nif se guardan aunque se repitan nombre y apellidos.

## Capabilities

### New Capabilities

- **crm-contacts-import**: Formulario de importación de contactos desde Excel (.xls/.xlsx), con template descargable, validación cliente y servidor (2 MB, 1000 filas), proceso de alta/actualización de users, crm_accounts y crm_contacts en la empresa en sesión, y feedback de filas no procesadas.

### Modified Capabilities

- (Ninguno: no se modifican requisitos de specs existentes en `openspec/specs/`.)

## Impact

- **Rutas**: Nuevas rutas GET/POST bajo prefijo crm-contacts, middleware de permiso `crm-contacts.create`.
- **Controller**: `app/Http/Controllers/Admin/CrmContactController.php`: métodos `import` e `importStore`; posible uso de librería de lectura Excel (PhpSpreadsheet o similar).
- **Front**: `resources/js/Pages/Admin/CrmContact/Index.jsx` (nuevo action), nueva página `resources/js/Pages/Admin/CrmContact/Import.jsx` (layout, texto i18n, enlace template, formulario, validación JS, estados de progreso y resultado).
- **Assets**: Template Excel en carpeta compartida para templates (p. ej. `storage/app/templates/` o `public/`).
- **i18n**: Claves nuevas para texto explicativo y mensajes de la vista de importación.
- **Modelos/DB**: Uso de `users`, `crm_accounts`, `crm_contacts`; lógica de búsqueda por email/nif (users) y tax_id (crm_accounts).
