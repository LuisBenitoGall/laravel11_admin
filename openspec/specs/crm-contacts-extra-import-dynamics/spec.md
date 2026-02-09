# Spec: Importación datos adicionales desde Dynamics (CSV)

## ADDED Requirements

### Requirement: Tabla temporal y comando de importación

MUST existir una tabla `crm_contacts_extra_tmp` exclusiva para este CSV, con columnas que reflejen las cabeceras: email, name, surname, cost_center, department, email2, email3, nif, position, phone1, phone2, phone3, contact_type, business_type. El comando `ImportCrmContactsExtra` SHALL leer el archivo `storage/app/import/contacts_all.csv` (o path configurado), detectar delimitador (tab o coma), usar la primera fila como cabeceras y cargar los registros en `crm_contacts_extra_tmp` siguiendo el patrón de `ImportCrmContacts`.

#### Scenario: Ejecutar import con CSV presente

- **WHEN** el usuario ejecuta el comando de importación (p. ej. `crm:import-contacts-extra`) y el archivo CSV existe en la ruta configurada
- **THEN** se leen las filas del CSV y se insertan o actualizan en `crm_contacts_extra_tmp` según el mapeo de columnas
- **AND** la primera fila del CSV se interpreta como cabeceras y no se inserta como dato

#### Scenario: Dry-run no persiste datos

- **WHEN** el comando se ejecuta con opción `--dry-run`
- **THEN** no se escriben registros en la tabla temporal
- **AND** se puede mostrar resumen de lo que se habría importado

---

### Requirement: Promoción — usuario por email

En el comando `PromoteCrmContactsExtra`, por cada fila de la temporal el sistema SHALL buscar un usuario por email. Si no existe, SHALL crear el usuario con name (required), surname, email, nif (opcionales), isAdmin false, status true. Si ya existe, SHALL verificar que name, surname y email estén informados (actualizar si faltan cuando corresponda).

#### Scenario: Email no existe — se crea usuario

- **WHEN** una fila de la temporal tiene un email que no existe en la tabla users
- **THEN** se crea un nuevo User con name, surname, email, nif según el CSV, isAdmin false, status true
- **AND** ese usuario se usa para el resto del procesamiento de la fila

#### Scenario: Email existe — se verifica name, surname, email

- **WHEN** una fila tiene un email que ya existe en users
- **THEN** se utiliza ese usuario
- **AND** se verifica que name, surname y email estén debidamente informados (se actualizan si estaban vacíos y el CSV trae valor)

---

### Requirement: Promoción — contacto CRM

Con el usuario resuelto, el sistema SHALL comprobar si existe un registro en `crm_contacts` para ese user_id y company_id (empresa del comando, p. ej. `--company=1`). Si no existe, SHALL crear el contacto con company_id, user_id, position, department, cost_center (literal del CSV), contact_type (mapeo vía HasContactTypes) y business_type (mapeo vía HasBusinessTypes). Solo se rellenan los campos indicados; el resto permanecen por defecto o null.

#### Scenario: No existe contacto — se crea

- **WHEN** para el user_id y company_id no existe un crm_contact
- **THEN** se crea un CrmContact con company_id, user_id, position, department, cost_center, contact_type, business_type según el CSV y los mapeos
- **AND** contact_type y business_type se resuelven mediante HasContactTypes y HasBusinessTypes

#### Scenario: Ya existe contacto — no se duplica

- **WHEN** ya existe un crm_contact para ese user_id y company_id
- **THEN** no se crea otro registro
- **AND** opcionalmente se pueden actualizar campos (position, department, cost_center, contact_type, business_type) si se define así

---

### Requirement: Mapeo contact_type

El valor de la columna `contact_type` del CSV SHALL resolverse contra `HasContactTypes::typesMap()`. La comparación SHALL ser razonable (normalizar: sin acentos, mayúsculas, espacios). Si existe coincidencia con la traducción en es.json del valor del mapa, se usa esa clave (índice, máx. 4 caracteres). Si no existe coincidencia, SHALL añadirse un nuevo índice en typesMap (máx. 4 caracteres, no repetido) y la cadena i18n en es.json y en.json.

#### Scenario: Valor CSV coincide con traducción existente

- **WHEN** el valor del CSV (normalizado) coincide con la traducción de una clave existente en typesMap (p. ej. es.json)
- **THEN** se usa esa clave como contact_type en crm_contacts
- **AND** no se modifica typesMap ni archivos i18n

#### Scenario: Valor CSV no coincide — se añade nuevo tipo

- **WHEN** el valor del CSV no coincide con ninguna traducción existente
- **THEN** se genera una nueva clave de máximo 4 caracteres no usada
- **AND** se añade la entrada en HasContactTypes::typesMap() y la cadena en es.json y en.json (y resto de idiomas definidos)

---

### Requirement: Mapeo business_type

El valor de la columna `business_type` del CSV SHALL resolverse contra `HasBusinessTypes::typesMap()`. La comparación SHALL ser con el literal del mapa (normalizada si aplica). Si coincide, se usa la clave numérica. Si no coincide, SHALL añadirse un nuevo índice y literal en el array HasBusinessTypes o manejarse con valor por defecto/log según diseño.

#### Scenario: Valor CSV coincide con literal existente

- **WHEN** el valor del CSV coincide con un literal existente en typesMap de HasBusinessTypes
- **THEN** se usa la clave numérica correspondiente como business_type en crm_contacts

#### Scenario: Valor CSV no coincide

- **WHEN** el valor del CSV no coincide con ningún literal existente
- **THEN** se aplica la estrategia definida (valor por defecto, nuevo índice en el concern, o log y null)

---

### Requirement: Teléfonos en tabla phones

Si existen valores en las columnas phone1, phone2, phone3 del CSV, el sistema SHALL incorporarlos en la tabla polimórfica `phones`, previa comprobación de que no existan (por e164, phoneable_type = User, phoneable_id = user->id). El número SHALL normalizarse a formato E.164 (p. ej. con giggsey/libphonenumber-for-php). Cada teléfono es un registro; no se duplican por e164 para el mismo usuario.

#### Scenario: Teléfono no existe — se inserta

- **WHEN** phone1 (o phone2, phone3) tiene valor y no existe un registro en phones con ese e164 para el user
- **THEN** se normaliza el número a E.164 y se inserta en phones con phoneable_type = User, phoneable_id = user->id
- **AND** se respeta prefijo + y región si aplica

#### Scenario: Teléfono ya existe — no se duplica

- **WHEN** el número normalizado ya existe en phones para ese user (mismo e164, phoneable_type, phoneable_id)
- **THEN** no se inserta un registro duplicado

---

### Requirement: Emails adicionales en user_emails

Si existen valores en las columnas email2 y email3 del CSV, el sistema SHALL incorporarlos en la tabla `user_emails`, previa comprobación de que no existan (por email y user_id). Cada email adicional es un registro.

#### Scenario: Email adicional no existe — se inserta

- **WHEN** email2 o email3 tiene valor y no existe un registro en user_emails con ese email y user_id
- **THEN** se inserta en user_emails (user_id, email, observations opcional)

#### Scenario: Email adicional ya existe — no se duplica

- **WHEN** ese email ya existe en user_emails para ese user_id
- **THEN** no se inserta un registro duplicado

---

### Requirement: Centros de coste y user_cost_centers

El literal de cost_center del CSV SHALL guardarse en `crm_contacts.cost_center` y SHALL referenciarse en la tabla `user_cost_centers`. El sistema SHALL comprobar la existencia del centro de coste por slug (slug del valor cost_center del CSV) y company_id. Si no existe, SHALL crear el centro de coste con company_id, name (valor CSV), slug (formato slug del name), status 1. Con el cost_center obtenido o creado, SHALL registrarse la relación en user_cost_centers comprobando que no exista ya la terna (company_id, user_id, cost_center_id); no pueden repetirse registros con los mismos tres valores.

#### Scenario: Centro de coste no existe — se crea y se vincula

- **WHEN** el valor cost_center del CSV no tiene un CostCenter con ese slug y company_id
- **THEN** se crea el CostCenter con company_id, name, slug, status 1
- **AND** se inserta en user_cost_centers (company_id, user_id, cost_center_id) si no existe la terna

#### Scenario: Terna ya existe en user_cost_centers

- **WHEN** ya existe un registro en user_cost_centers con el mismo company_id, user_id y cost_center_id
- **THEN** no se inserta un registro duplicado
