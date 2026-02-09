# Change: Importación datos adicionales desde Dynamics

## Why

Completar información que falta sobre numerosos contactos CRM importando datos adicionales desde un CSV exportado de Dynamics (`storage/app/import/contacts_all.csv`). El objetivo es enriquecer la base de contactos existente con nombres, apellidos, emails, teléfonos, centros de coste, tipos de contacto y negocio, y emails/teléfonos adicionales, sin perder el flujo en dos fases (import a temporal, promote a definitiva) que ya usan los comandos existentes.

## What Changes

- **Nueva tabla temporal** `crm_contacts_extra_tmp` exclusiva para este CSV, con columnas que reflejan las cabeceras: email, name, surname, cost_center, department, email2, email3, nif, position, phone1, phone2, phone3, contact_type, business_type.
- **Comando** `ImportCrmContactsExtra`: lee `contacts_all.csv` y carga los registros en `crm_contacts_extra_tmp`. Sigue el patrón de `ImportCrmContacts` (detectar delimitador, mapeo cabecera→columnas, config).
- **Comando** `PromoteCrmContactsExtra`: promociona desde `crm_contacts_extra_tmp` a tablas definitivas. Por cada fila:
  1. Buscar o crear User por email; si no existe, crearlo con name, surname, email, nif, isAdmin false, status true; si existe, verificar que name, surname y email estén informados.
  2. Buscar o crear CrmContact por user_id y company_id; si no existe, crearlo con company_id, user_id, position, department, cost_center, contact_type (mapeo vía HasContactTypes + i18n), business_type (mapeo vía HasBusinessTypes).
  3. Incluir teléfonos (phone1, phone2, phone3) en tabla polimórfica `phones` si no existen (comparar por e164, phoneable_type=User, phoneable_id). Normalizar a E.164 con giggsey/libphonenumber-for-php.
  4. Incluir emails adicionales (email2, email3) en `user_emails` si no existen (comparar por email y user_id).
  5. Vincular centros de coste: buscar o crear CostCenter por slug y company_id; registrar en `user_cost_centers` si no existe (company_id, user_id, cost_center_id únicos).
- **HasContactTypes**: Permitir añadir nuevos índices (máx. 4 caracteres) cuando el valor del CSV no coincida con ninguna traducción existente en es.json; añadir la cadena i18n en es.json y en.json.
- **HasBusinessTypes**: Permitir añadir nuevos índices cuando el valor del CSV no coincida con ningún literal existente.
- **Config**: Nueva entrada en `config/crm_import.php` (o archivo dedicado) para el path del CSV y el mapeo de columnas.

## Capabilities

### New Capabilities

- **crm-contacts-extra-import-dynamics**: Importación en dos fases (Import a tabla temporal, Promote a tablas definitivas) de datos adicionales de contactos desde CSV de Dynamics, incluyendo usuarios, contactos CRM, teléfonos, emails adicionales y centros de coste, con mapeo dinámico de contact_type y business_type.

### Modified Capabilities

- (Ninguno: HasContactTypes y HasBusinessTypes se extienden con lógica de añadir índices, pero no cambian requisitos de specs existentes en `openspec/specs/`.)

## Impact

- **Migraciones**: Nueva tabla `crm_contacts_extra_tmp` con columnas según cabeceras del CSV.
- **Comandos**: `ImportCrmContactsExtra`, `PromoteCrmContactsExtra` (patrón de ImportCrmContacts/PromoteCrmContacts).
- **Modelos**: Nuevo modelo `CrmContactExtraTmp`; uso de User, CrmContact, Phone, UserEmail, CostCenter, UserCostCenter.
- **Concerns**: HasContactTypes y HasBusinessTypes aceptan lógica de auto-añadir índices cuando no hay coincidencia.
- **i18n**: es.json y en.json para nuevas cadenas de contact_type.
- **Config**: Entrada para `contacts_all` en crm_import o similar.
- **Dependencias**: giggsey/libphonenumber-for-php para normalización de teléfonos a E.164.
