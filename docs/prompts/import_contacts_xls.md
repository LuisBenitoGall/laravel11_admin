- 07/02/2026:

Módulo de importación de contactos. Crea un módulo de importación de contactos a través de archivos .xls con las siguientes características:

Incluye un action en la vista admin/crm-contacts con el texto i18n contactos_importar y el icon la-file-import

Crea la ruta get crm-contacts/import

Crea el método CrmContactController@import para renderizar la vista con el formulario de importación. Sigue el consenso de parámetros de otros métodos del mismo controller como Index.

Crea la vista resources/js/Pages/Admin/CrmContact/Import.jsx. Incluye todos los componentes y layouts necesarios. Guíate por otras vistas como resources/js/Pages/Admin/CrmContact/Index.jsx resources/js/Pages/Admin/User/Edit.jsx para tener claro todo su contenido.

La vista debe contener como elementos propios:
- texto (i18n) explicativo con las condiciones para importar el archivo: formato, peso máximo,... Considera unas condiciones viables para poder subir archivos sin sobrecargar el servidor.
- un link al template .xls que deben utilizar para importar los contactos.
- el formulario con un input type="file" para subir el archivo.
- considera si hay que incluir algo más.

Crea un template.xls, dale un nombre descriptivo, alójalo en la carpeta que consideres más conveniente teniendo en cuenta que habrá más templates similares, e incluye las siguientes columnas:
- name
- surname
- user_email
- user_nif
- position
- department
- observations
- company
- company_nif
- company_city
- company_postal_code
- company_street
- company_phone1
- company_email

Hacer validación .js del archivo a subir.

Crear método post CrmContactController@importStore para guardar los registros. Incluye la validación necesaria: formato archivo, peso,...

Proceso para guardar registros:
- Limpiar y normalizar los datos recibidos: evitar espacios en blanco al inicio y el fin, todo en minúscula, evitar caracteres conflictivos,...
- Guardar en tabla users previa comprobación que no exista el email o nif del usuario. Si no tiene email ni nif igual se guarda aunque se repitan nombre y apellidos. Campos a guardar en su relación con la columna del template:
	- name -> name: required
	- surname -> surname: optional
	- user_email -> email: optional
	- user_nif -> nif: optional
	- isAdmin: false
	- status: true

- Guardar u obtener los datos de la cuenta (crm_accounts) a través del campo crm_accounts.tax_id. Campos a guardar en su relación con la columna del template:
	- company -> name: required
	- normalized_name: el el slug de name
	- company_nif -> tax_id: optional
	- company_city -> billing_city: optional
	- company_postal_code -> billing_postal_code: optional
	- company_street -> billing_street: optional
	- company_phone -> main_phone: optional
	- company_email -> main_email: optional

- Con el user y la cuentas creadas u obtenidas comprobar si existe en crm_contacts mediante crm_contacts.user_id. Si no existe, crear. Campos a guardar en su relación con la columna del template:
	- company_id: $currentCompanyId
	- user_id: $user->id
	- crm_account_id: $crm_account->id (si existe)
	- poistion -> position: optional
	- department -> department: optional
	- observations -> observations: optional

Durante el proceso mostrar algún spinner o barra de progreso con algun texto tranquilizador para el usuario.

Al final, mostrar en pantalla mensaje de éxito o fracaso, y también, si han quedado líneas sin poder registrar, mostrarlas por pantalla indicando que no se han podido procesar.

Una vez más y como siempre, pregunta cualquier duda antes de empezar a codear.


---------------------------------------------------------------------------------------------------

Respondo tus dudas:

1. Columna del template: En el listado de columnas pusiste company_phone1 y en el mapeo a cuenta company_phone -> main_phone. ¿Confirmamos que la columna del .xls es company_phone1 y se mapea a main_phone?

RESPUESTA: errata mía, la columna en el template debe ser company_phone y el campo main_phone

2. Formato del archivo: ¿Solo .xls (Excel 97–2003) o también .xlsx? Para PHP suele ser más sencillo usar una librería que lea ambos; si quieres solo .xls lo dejamos explícito en la spec.

RESPUESTA: permite ambos

3. Límites de subida: ¿Te encaja un máximo de 2 MB y máximo N filas (por ejemplo 500 o 1000) por archivo para no sobrecargar el servidor, o prefieres otros valores?

RESPUESTA: si te parecen valores razonables, adelante con 2MB y 1000 filas, pero hay que explicarlo en la vista para los usuarios.

4. Permisos: ¿La ruta crm-contacts/import (y el POST) deben estar protegidas por el mismo permiso que el listado (p. ej. crm-contacts.index o crm-contacts.create) o quieres un permiso específico tipo crm-contacts.import?

RESPUESTA: para el permisos crm-contacts.create. Si el usuario carece de este permiso no se le muestra el CTA y se le bloquea el acceso a la vista.

6. Empresa (company_id): Los contactos se crean con company_id: $currentCompanyId. ¿Siempre usamos la empresa del contexto actual (como en el resto del CRM)?

RESPUESTA: correcto, salvo especificación de empresa, siempre es la empresa en sesión.


---------------------------------------------------------------------------------------------------

- 08/09/2026

Importación datos adicionales desde Dynamics. Vamos a completar datos de crm_contacts importando el .csv storage/app/import/contacts_all.csv
La primera fila son las cabeceras.

Quiero que prepares los comandos: 
- app/Console/Commands/ImportCrmContactsExtra.php, para importar de .csv a una tabla temporal
- app/Console/Commands/PromoteCrmContactsExtra.php, para importar de la tabla temporal a la definitiva crm_contacts

Sigue los ejemplos que encontrarás en app/Console/Commands/ImportCrmContacts.php y app/Console/Commands/PromoteCrmContacts.php

El objetivo es completar información que falta sobre numerosos contactos.

Pasos a seguir:

1. Comprueba mediante la columna email la existencia del usuario en la tabla users. Si no existe lo creas completando los siguientes campos:
	- name -> name: required
	- surname -> surname: optional
	- email -> email: optional
	- nif -> nif: optional
	- isAdmin: false
	- status: true
Y si ya existía verifica que tuviese los campos name, surname y email debidamente informados.

2. Con $user comprueba si existe como contacto en crm_contacts. Si no existe lo creas con los siguientes campos:
	- company_id: $currentCompanyId (empresa en sesión)
	- user_id: $user->id
	- position -> position: optional
	- department -> department: optional
	- cost_center -> cost_center: optional
	- contact_type -> Ver *Tipo de contacto
	- business_type -> Ver **Tipo de negocio


*Tipo de contacto: Para obtener contact_type debes recurrir a app/Concerns/HasContactTypes.php. En este archivo hay un array con un mapeo de tipos de contacto. Tu debes guardar el índice, y para obtenerlo debes hacer la siguiente operación: el valor de cada índice es un string i18n, para conocer su traducción debes ir a lang/es.json. Compara razonablemente -no literalmente, es decir, omite acentos, mayúsculas,...- el valor del índice con la columna contact_type. Si existe concordancia ya tienes el valor para la columna contact_type con el índice de typesMap(); si no hay concordancia añades un nuevo índice en typesMap(), siempre debe ser un string de máximo 4 caracteres y que no se repita, e incluyes la cadena i18n en es.json y el resto de idiomas.


**Tipo de negocio: para obtener el tipo de negocio debes recurrir a app/Concerns/HasBusinessTypes.php. La lógica es similar a Tipo de contacto pero más simple. Aquí el array es numérico y no concurre i18n, el valor de cada índice es el literal con el que tienes que comparar el valor de la columna contact_type del .csv. Si no existe el índice, incluyes uno nuevo en el array HasBusinessTypes@typesMap.


3. Incluir teléfonos. Si existen valores en las columnas del .csv phone1, phone2 y phone3 debes incluirlos, previa comprobación que no existan, en la tabla polimórfica phones.
La comprobación es contra el campo phones.e164 y phoneable_type = App\Models\User y phoneable_id = $user->id. Vigila el formato del teléfono, por si incluye prefijo + al inicio,...
Cada teléfono es un registro.

4. Emails adicionales. Si existen valores en las columnas del .csv email2 y email3 debes incluirlos, previa comprobación que no existan, en la tabla user_emails.
La comprobación es contra el campo email y user_id = $user->id

5. Centros de coste. Aparte de incluir el literal de cost_center en crm_contacts.cost_center hay que referenciarlo en la tabla user_cost_centers.
Comprueba la existencia del valor slug de cost_center en el .csv contra cost_centers.slug y que company_id = $currentCompanyId. Si no existe creas el centro de coste con estos campos:
	- company_id -> $currentCompanyId (empresa en sesión)
	- name -> cost_center del .csv
	- slug -> formato slug del cost_center del .csv
	- status -> 1
Con $cost_center->id puedes guardar el registro en user_cost_centers comprobando que no exista previamente la relación company_id = $currentCompanyId, user_id = $user->id y cost_center_id = $cost_center->id.
No pueden repetirse registros que contengan estos tres mismos valores.

Nuevamente y siempre, pregunta cualquier duda que tenga al respecto antes de empezar a codear.


---------------------------------------------------------------------------------------------------

Respondo tus dudas:

1. Tabla temporal
¿Quieres reutilizar crm_contacts_tmp (añadiendo columnas: phone1, phone2, phone3, email2, email3, business_type, etc.) o prefieres una tabla nueva (p. ej. crm_contacts_extra_tmp) solo para este CSV de Dynamics?

RESPUESTA: prefiero que crees una nueva tabla exclusiva para este csv.

2. Columna para tipo de negocio en el CSV
En el punto 2 indicas “compara el valor de la columna contact_type del .csv” para tipo de negocio. ¿Es un error y la columna del CSV para tipo de negocio es otra (p. ej. business_type)? Si el CSV tiene una columna distinta, ¿cuál es su nombre exacto?

RESPUESTA: Es un error, gracias por advertirlo. Debes compararlo con la columna business_type

3. Cabeceras exactas del CSV
Como el archivo storage/app/import/contacts_all.csv no está en el repo, ¿puedes confirmar o pegar la primera línea (cabeceras) del CSV? Necesito los nombres exactos de: email, name, surname, nif, position, department, cost_center, contact_type, business_type (o el que sea), phone1, phone2, phone3, email2, email3.

RESPUESTA: Te paso la fila de cabeceras: email	name	surname	cost_center	department	email2	email3	nif	position	phone1	phone2	phone3	contact_type	business_type
pero comprueba que el .csv está en su sitio indicado, al menos yo lo estoy viendo ahí en estos mismos momentos.

4. Empresa en sesión en comandos Artisan
En los comandos no hay “sesión” de usuario. ¿Debe ser un parámetro del comando (p. ej. --company=1) como en PromoteCrmContacts, y ese company_id usarse como $currentCompanyId en todo el flujo?

RESPUESTA: si tienes alguna dificultad para dar con la info, utiliza $currentCompanyId = 1

5. Teléfonos: formato e164
Para guardar en phones.e164: ¿usas ya la librería giggsey/libphonenumber-for-php (o similar) en el proyecto para normalizar a E.164? Si no, ¿prefieres guardar el número tal cual viene en el CSV (quitando solo espacios/prefijo +) o quieres que integre normalización E.164 en este cambio?

RESPUESTA: normalízalo utilizando la misma librería.

6. Tabla user_emails
Confirmo que existe la migración create_user_emails_table. ¿La estructura es algo tipo user_id, email, y opcionalmente id/timestamps? Si tienes el nombre exacto de la tabla y de las columnas (sobre todo user_id y email), indícalo para usarlas tal cual.

RESPUESTA: te paso la estructura de la tabla
CREATE TABLE `user_emails` (
	`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` BIGINT(20) UNSIGNED NOT NULL,
	`email` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`observations` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `user_emails_user_id_index` (`user_id`) USING BTREE,
	INDEX `user_emails_email_index` (`email`) USING BTREE,
	CONSTRAINT `user_emails_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `admin11_db`.`users` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;

7. Idiomas para i18n (contact_type)
Para nuevos tipos de contacto que se añadan a HasContactTypes::typesMap() indicas “incluyes la cadena i18n en es.json y el resto de idiomas”. ¿Qué otros idiomas hay en el proyecto además de es (por ejemplo lang/en.json, lang/ca.json)?

RESPUESTA: existe ahora mismo es.json y en.json


