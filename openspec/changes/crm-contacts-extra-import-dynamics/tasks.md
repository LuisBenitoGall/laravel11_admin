## 1. Migración y modelo

- [x] 1.1 Crear migración para tabla `crm_contacts_extra_tmp` con columnas: email, name, surname, cost_center, department, email2, email3, nif, position, phone1, phone2, phone3, contact_type, business_type (todas nullable string/text según tamaño)
- [x] 1.2 Crear modelo `CrmContactExtraTmp` en `app/Models/` con fillable y tabla `crm_contacts_extra_tmp`

## 2. Configuración

- [x] 2.1 Añadir entrada `contacts_all` o `contacts_extra` en `config/crm_import.php`: file (storage_path('app/import/contacts_all.csv')), model (CrmContactExtraTmp), mapping (cabeceras CSV → columnas BD)

## 3. Comando ImportCrmContactsExtra

- [x] 3.1 Crear `app/Console/Commands/ImportCrmContactsExtra.php` siguiendo patrón de ImportCrmContacts: leer config, abrir CSV, detectar delimitador (tab o coma), leer cabeceras, mapear filas a la temporal
- [x] 3.2 Soportar opción `--dry-run` que no persiste en BD
- [x] 3.3 Registrar el comando en Kernel o via auto-discovery

## 4. Comando PromoteCrmContactsExtra — usuario y contacto

- [x] 4.1 Crear `app/Console/Commands/PromoteCrmContactsExtra.php` con opciones `--company=1` (fallback 1), `--chunk`, `--dry-run`
- [x] 4.2 Por cada fila: buscar User por email; si no existe crear con name, surname, email, nif, isAdmin false, status true; si existe verificar/actualizar name, surname, email
- [x] 4.3 Buscar CrmContact por user_id y company_id; si no existe crear con company_id, user_id, position, department, cost_center (literal), contact_type, business_type
- [x] 4.4 Implementar resolución de contact_type: normalizar valor CSV, comparar con traducciones de typesMap en es.json (reasonably); si no coincide, generar nueva clave (máx. 4 chars), añadir a typesMap + es.json + en.json
- [x] 4.5 Implementar resolución de business_type: comparar valor CSV con literales de HasBusinessTypes::typesMap(); si no coincide, usar valor por defecto o log (según design)

## 5. Promote — teléfonos

- [x] 5.1 Por cada valor no vacío en phone1, phone2, phone3: normalizar a E.164 con giggsey/libphonenumber-for-php (región ES si no hay prefijo)
- [x] 5.2 Comprobar que no exista en phones (e164, phoneable_type=User, phoneable_id); si no existe insertar en phones
- [x] 5.3 Manejar números inválidos (no insertar, opcional log)

## 6. Promote — emails adicionales

- [x] 6.1 Por cada valor no vacío en email2, email3: comprobar que no exista en user_emails (user_id, email); si no existe insertar en user_emails

## 7. Promote — centros de coste

- [x] 7.1 Si cost_center tiene valor: buscar CostCenter por slug (del valor CSV) y company_id; si no existe crear con company_id, name, slug, status 1
- [x] 7.2 Comprobar que no exista en user_cost_centers la terna (company_id, user_id, cost_center_id); si no existe insertar
- [x] 7.3 Guardar literal cost_center en crm_contacts.cost_center

## 8. i18n y concerns

- [x] 8.1 Para nuevos contact_type: añadir cadenas en es.json y en.json al añadir índice en typesMap
- [x] 8.2 Implementar helper o método que normalice strings para comparación (quitar acentos, minúsculas, trim) reutilizable en contact_type y business_type

## 9. Verificación

- [x] 9.1 Ejecutar migración y comprobar que la tabla crm_contacts_extra_tmp existe
- [x] 9.2 Ejecutar `crm:import-contacts-extra` con CSV de prueba y verificar que se cargan registros en la temporal
- [x] 9.3 Ejecutar `crm:promote-contacts-extra --company=1` y verificar que se crean/actualizan users, crm_contacts, phones, user_emails, cost_centers, user_cost_centers según especificación
- [x] 9.4 Comprobar que no se duplican teléfonos (mismo e164), emails (mismo user_id+email) ni ternas en user_cost_centers
